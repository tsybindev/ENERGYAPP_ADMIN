import API from '../../../axiosConfig'
import { parseCookies } from 'nookies'

export async function checkType(type: string, item_id: string, context?: any) {
	try {
		let token
		if (context?.req) {
			// На сервере
			token = context.req.cookies?.users_access_token
		} else {
			// На клиенте
			const cookies = parseCookies(context)
			token = cookies.users_access_token
		}

		if (!token) {
			throw new Error('No token found')
		}
		console.log('url:', `/${type}s/${item_id}/`)
		const response = await API.get(`/${type}s/${item_id}/`, {
			validateStatus: status => status >= 200 && status < 500,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		return response.status === 200 ? response.data : null
	} catch (error) {
		console.error('Error in checkType:', error)
		throw error
	}
}
