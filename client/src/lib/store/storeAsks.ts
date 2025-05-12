//@ts-ignore
//@ts-nocheck

import { makeAutoObservable } from 'mobx'
import Cookies from 'js-cookie'
import { Asks } from '@/lib/types/Asks'
import { getAsk, getAsks } from '@/lib/api/Asks'

class StoreAsks {
	isLoad = true
	asks: Asks[] | null = null
	ask: Asks | null = null

	constructor() {
		makeAutoObservable(this, {
			setAsks: true,
			setAsk: true,
		})
	}

	async loading(module_id: string) {
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getAsks(token, module_id)
			this.setAsks(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	async getAsk(asks_id: string) {
		// Проверяем, есть ли уже данные и совпадает ли id
		if (this.ask && this.ask.item_id === asks_id) {
			return this.ask
		}
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getAsk(token, asks_id)
			this.setAsk(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	setAsks(data: Asks[]) {
		this.asks = data
	}

	setAsk(data: Asks) {
		this.ask = data
	}

	initializeAsk(askData) {
		if (askData) {
			this.ask = askData
			this.isLoad = false
		}
	}
}

const storeAsks = new StoreAsks()
export default storeAsks
