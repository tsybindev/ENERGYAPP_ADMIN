import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { observer } from 'mobx-react'
import StoreUser from '@/lib/store/storeUser'
import { useRouter } from 'next/router'
import API from '../../../axiosConfig'
import Cookies from 'js-cookie'
import { Button } from '../ui/button'

const Profile = observer(() => {
	const profile = StoreUser.user

	const initials = `${profile?.first_name?.slice(0, 1) || ''}${
		profile?.last_name?.slice(0, 1) || ''
	}`.toUpperCase()

	const router = useRouter()

	const handleLogout = async () => {
		const token = Cookies.get('users_access_token')
		try {
			const response = API.delete('/logout/', {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})
			Cookies.remove('users_access_token')
			Cookies.remove('users_refresh_token')
			Cookies.remove('user_id')

			await router.push('/auth')
		} catch (e) {
			console.log(e)
		}
	}

	return (
		<div className={'flex flex-col gap-2 py-2'}>
			<div className={'flex flex-row items-center gap-2'}>
				<Avatar>
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<div className='flex flex-col'>
					<p className='text-sm font-medium'>
						{profile?.first_name} {profile?.last_name}
					</p>
					<p className='text-xs text-muted-foreground'>{profile?.email}</p>
				</div>
			</div>
			<Button
				className='flex justify-center items-center gap-2 mt-2 bg-[#FF3E36] hover:bg-[#FF3E36]/90 text-white'
				onClick={handleLogout}
			>
				<LogOut size={16} />
				<span>Выход</span>
			</Button>
		</div>
	)
})

export default Profile
