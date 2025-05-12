//@ts-ignore
//@ts-nocheck

import API from '../../../axiosConfig'

export async function getLessons(token: string) {
	const response = await API.get('/lessons/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function getLesson(token: string, lesson_id: string) {
	const response = await API.get(`/lessons/${lesson_id}/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		params: {
			lesson_id: lesson_id,
		},
	})

	return response.data
}

export async function createLesson(
	token: string,
	title: string,
	module_id: string
) {
	const response = await API.post(
		'/lesson/',
		{
			title: title,
			module_id: module_id,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function deleteLesson(token: string, item_id: string) {
	const response = await API.patch(
		`/lessons/`,
		{
			item_ids: [item_id],
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function editTitleLesson(
	token: string,
	lesson_id: string,
	title: string
) {
	const response = await API.patch(
		`/lessons/${lesson_id}/`,
		{
			title: title,
			lesson_id: lesson_id,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function editContentLesson(
	token: string,
	lesson_id: string,
	title: string,
	content
) {
	const response = await API.patch(
		`/lessons/${lesson_id}/`,
		{
			title: title,
			lesson_id: lesson_id,
			content: content,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}
