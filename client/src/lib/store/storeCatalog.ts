//@ts-ignore
//@ts-nocheck

import { Catalog } from '@/lib/types/Catalogs'
import { makeAutoObservable } from 'mobx'
import { getCatalog } from '@/lib/api/Catalogs'
import Cookies from 'js-cookie'

class StoreCatalog {
	isLoad = true
	catalog: Catalog[] | null = null

	constructor() {
		makeAutoObservable(this, {
			setCatalog: true,
		})
	}

	async loading() {
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getCatalog(token)
			this.setCatalog(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	setCatalog(data: Catalog[]) {
		this.catalog = data
	}
}

const storeCatalog = new StoreCatalog()
export default storeCatalog
