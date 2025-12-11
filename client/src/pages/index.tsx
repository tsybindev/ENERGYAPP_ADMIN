import React, { useEffect, useState } from 'react'

import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { observer } from 'mobx-react'
import { Download, X } from 'lucide-react'

import Head from 'next/head'
import { Button } from '@/components/ui/button'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import storeAttempts from '@/lib/store/storeAttempts'
import { downloadUserAttempts } from '@/lib/api/Users'
import { UserSearch } from '@/components/elements/UserSearch'
import { CoursesAccordion } from '@/components/attempts/CoursesAccordion'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const Home = observer(() => {
	const [checkedAttempts, setCheckedAttempts] = useState<Set<string>>(new Set())
	const [selectedUser, setSelectedUser] = useState<{
		id: string
		name: string
		email: string
	} | null>(null)
	const [isDownloading, setIsDownloading] = useState(false)
	const [downloadStatus, setDownloadStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle')

	useEffect(() => {
		storeAttempts.loadUsers()
	}, [])

	// Сбрасываем статус кнопки через 2 секунды после успеха или ошибки
	useEffect(() => {
		if (downloadStatus !== 'idle') {
			const timer = setTimeout(() => {
				setDownloadStatus('idle')
			}, 2000)
			return () => clearTimeout(timer)
		}
	}, [downloadStatus])

	const handleToggleAttempt = (id: string) => {
		setCheckedAttempts(prev => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const handleDownload = async () => {
		if (!selectedUser) return

		const toastId = toast.loading('Скачивание файла...')

		try {
			setIsDownloading(true)
			const token = Cookies.get('users_access_token')
			if (!token) {
				throw new Error('No token found')
			}

			const blob = await downloadUserAttempts(
				token,
				selectedUser.id,
				Array.from(checkedAttempts)
			)

			// Создаем ссылку для скачивания
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `attempts_user_${selectedUser.id}.zip`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)

			setDownloadStatus('success')
			toast.success('Файл успешно скачан', {
				id: toastId,
				duration: 5000,
				richColors: true,
				action: (
					<div className='absolute top-[10px] right-[10px]'>
						<X
							size={16}
							className='hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out'
							onClick={() => toast.dismiss()}
						/>
					</div>
				),
			})
		} catch (error) {
			console.error(error)
			setDownloadStatus('error')
			toast.error('Не удалось скачать файл', {
				id: toastId,
				duration: 5000,
				richColors: true,
				action: (
					<div className='absolute top-[10px] right-[10px]'>
						<X
							size={16}
							className='hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out'
							onClick={() => toast.dismiss()}
						/>
					</div>
				),
			})
		} finally {
			setIsDownloading(false)
		}
	}

	const getButtonVariant = () => {
		switch (downloadStatus) {
			case 'success':
				return 'default'
			case 'error':
				return 'destructive'
			default:
				return 'outline'
		}
	}

	const handleUserSelect = (user: {
		id: string
		name: string
		email: string
	}) => {
		setSelectedUser(user)
		storeAttempts.loadUserCourses(user.id)
	}

	const hasAttempts = checkedAttempts.size > 0

	return (
		<>
			<Head>
				<title>ЭНЕРГИЯ - Результаты фотофиксации</title>
			</Head>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
						<SidebarTrigger className='-ml-1 text-green-600 hover:text-green-700 hover:bg-green-50' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<div className='w-full flex flex-row justify-between items-center gap-4'>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>Главная</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>
											Результаты фотофиксации по аттестации
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<main className='flex-1 p-4'>
						<div className='mb-4 flex items-center gap-2'>
							<UserSearch
								users={storeAttempts.users}
								onSelect={handleUserSelect}
							/>
							<Button
								onClick={handleDownload}
								disabled={!hasAttempts || isDownloading}
								variant={getButtonVariant()}
								className='bg-green-600 hover:bg-green-700 text-white'
							>
								<Download className='h-4 w-4 mr-1' />
								{isDownloading ? 'Скачивание...' : 'Скачать'}
							</Button>
						</div>
						<div className='mt-6'>
							{selectedUser ? (
								<CoursesAccordion
									courses={storeAttempts.userCourses}
									checkedAttempts={checkedAttempts}
									onToggle={handleToggleAttempt}
									isLoading={storeAttempts.loading}
									onDeleteAttempt={async attemptId => {
										const toastId = toast.loading('Аннулирование экзамена...')
										try {
											await storeAttempts.deleteAttempt(attemptId)
											toast.success('Экзамен успешно аннулирован', {
												id: toastId,
												duration: 5000,
												richColors: true,
											})
										} catch (error) {
											toast.error('Не удалось аннулировать экзамен', {
												id: toastId,
												duration: 5000,
												richColors: true,
											})
										}
									}}
								/>
							) : (
								<div className='text-center text-gray-500 py-8'>
									Введите ФИО или email пользователя, затем выберите
									курсы/попытки для скачивания результатов
								</div>
							)}
						</div>
					</main>
				</SidebarInset>
			</SidebarProvider>
		</>
	)
})

export default Home
