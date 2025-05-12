import API from '../../../axiosConfig'
import { ApiUser, ApiUserCourseAttempts } from '@/types/attempts'

export async function getUsers(token: string) {
	const response = await API.get<ApiUser[]>('/users/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function getUserAttempts(token: string, userId: string) {
	const response = await API.get<ApiUserCourseAttempts[]>(
		`/user/${userId}/course/attempts/`,
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function downloadUserAttempts(
	token: string,
	userId: string,
	attemptIds: string[]
) {
	const params = new URLSearchParams()
	attemptIds.forEach(id => params.append('at_ids', id))

	const response = await API.get(`/download/foto/${userId}/attempts/`, {
		params,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		responseType: 'blob',
		paramsSerializer: {
			indexes: null, // Это предотвратит добавление индексов к параметрам массива
		},
	})

	return response.data
}
