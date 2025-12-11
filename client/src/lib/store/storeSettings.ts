import { makeAutoObservable } from 'mobx'
import { getExamPercent, updateExamPercent } from '@/lib/api/Settings'
import { toast } from 'sonner'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import Cookies from 'js-cookie'

class SettingsStore {
	percent: number | null = null
	isLoading: boolean = false
	error: string | null = null

	constructor() {
		makeAutoObservable(this)
	}

	fetchPercent = async () => {
		this.isLoading = true
		this.error = null
		const token = Cookies.get('users_access_token')
		try {
			if (token) {
				const response = await getExamPercent(token)
				this.percent = response.data.percent
			}
		} catch (error: any) {
			const err = httpErrorsSplit(error)
			this.error = err
		} finally {
			this.isLoading = false
		}
	}

	setPercent = async (newPercent: number) => {
		this.isLoading = true
		this.error = null
		const token = Cookies.get('users_access_token')

		try {
			if (token) {
				await updateExamPercent(newPercent, token)
				this.percent = newPercent
				toast.success('Проходной процент успешно обновлен!', {
					duration: 5000,
					richColors: true,
				})
			}
		} catch (error: any) {
			const err = httpErrorsSplit(error)
			this.error = err
			toast.error(err, {
				duration: 5000,
				richColors: true,
			})
			throw new Error(err)
		} finally {
			this.isLoading = false
		}
	}
}

const storeSettings = new SettingsStore()
export default storeSettings
