import API from '../../../axiosConfig'

export async function getExamPercent(token: string) {
	const response = await API.get('/settings/exam_percent/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function updateExamPercent(percent: number, token: string) {
	const response = await API.post(
		`/settings/exam_percent/${percent}/`,
		{},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}
