//@ts-ignore
//@ts-nocheck

import { Catalog } from '@/lib/types/Catalogs'
import { makeAutoObservable } from 'mobx'
import { getCatalog } from '@/lib/api/Catalogs'
import Cookies from 'js-cookie'
import { Courses } from '@/lib/types/Courses'
import { getCourse, getCourses } from '@/lib/api/Courses'
import { Modules } from '@/lib/types/Modules'
import { getModule, getModules } from '@/lib/api/Modules'

class StoreModule {
	isLoad = true
	modules: Modules[] | null = null
	module: Modules | null = null

	constructor() {
		makeAutoObservable(this, {
			setModules: true,
			setModule: true,
		})
	}

	async loading() {
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getModules(token)
			this.setModules(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	async getModule(item_id: string) {
		// Проверяем, есть ли уже данные и совпадает ли id
		if (this.module && this.module.item_id === item_id) {
			return this.module
		}
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getModule(token, item_id)
			this.setModule(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	setModules(data: Modules[]) {
		this.modules = data
	}

	setModule(data: Modules) {
		this.module = data
	}

	initializeModule(moduleData) {
		if (moduleData) {
			this.module = moduleData
			this.isLoad = false
		}
	}
}

const storeModule = new StoreModule()
export default storeModule
