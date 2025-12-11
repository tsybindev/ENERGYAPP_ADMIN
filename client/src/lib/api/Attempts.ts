import API from '../../../axiosConfig'
import { ApiAttemptPhoto } from '@/types/attempts'

export async function getAttemptPhotos(token: string, attemptId: string) {
	const response = await API.get<ApiAttemptPhoto>(
		`/attempts/${attemptId}/course/exam/foto/`,
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function deleteAttempt(token: string, attemptId: string) {
	const response = await API.delete(`/attempts/${attemptId}/`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	return response.data
}
