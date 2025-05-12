import React, { useState, useMemo, useRef, useEffect } from 'react'

interface User {
	id: string
	name: string
	email: string
}

interface UserSearchProps {
	users: User[]
	onSelect: (user: User) => void
}

export function UserSearch({ users, onSelect }: UserSearchProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [isOpen, setIsOpen] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const filteredUsers = useMemo(() => {
		const query = searchQuery.toLowerCase().trim()
		if (!query) return []
		return users.filter(
			user =>
				user.name.toLowerCase().includes(query) ||
				user.email.toLowerCase().includes(query)
		)
	}, [users, searchQuery])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setSelectedIndex(prev => Math.min(prev + 1, filteredUsers.length - 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setSelectedIndex(prev => Math.max(prev - 1, -1))
		} else if (e.key === 'Enter' && selectedIndex >= 0) {
			e.preventDefault()
			const selectedUser = filteredUsers[selectedIndex]
			if (selectedUser) {
				handleSelect(selectedUser)
			}
		} else if (e.key === 'Escape') {
			setIsOpen(false)
		}
	}

	const handleSelect = (user: User) => {
		onSelect(user)
		setSearchQuery(user.name)
		setIsOpen(false)
		setSelectedIndex(-1)
		inputRef.current?.blur()
	}

	return (
		<div className='relative w-[350px]' ref={dropdownRef}>
			<input
				ref={inputRef}
				type='text'
				placeholder='Поиск по ФИО или email...'
				value={searchQuery}
				onChange={e => {
					setSearchQuery(e.target.value)
					setIsOpen(true)
					setSelectedIndex(-1)
				}}
				onFocus={() => setIsOpen(true)}
				onKeyDown={handleKeyDown}
				className='w-full px-3 py-2 border rounded-md'
			/>
			{isOpen && filteredUsers.length > 0 && (
				<div className='absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[400px] overflow-y-auto'>
					{filteredUsers.map((user, index) => (
						<div
							key={user.id}
							onClick={() => handleSelect(user)}
							onMouseEnter={() => setSelectedIndex(index)}
							className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
								selectedIndex === index ? 'bg-gray-100' : ''
							}`}
						>
							<div className='font-medium'>{user.name}</div>
							<div className='text-sm text-gray-500'>{user.email}</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
