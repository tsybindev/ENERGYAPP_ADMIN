//@ts-ignore
//@ts-nocheck

import { User } from '@/lib/types/User'
import { makeAutoObservable } from 'mobx'
import Cookies from 'js-cookie'
import { getMe } from '@/lib/api/User'

class StoreUser {
	isLoad = true
	user: User | null = null

	constructor() {
		makeAutoObservable(this, {
			setUser: true,
		})
	}

	async loading() {
		const user_id = Cookies.get('user_id')
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getMe(user_id, token)
			this.setUser(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	setUser(data: User) {
		this.user = data
	}
}

const storeUser = new StoreUser()
export default storeUser
