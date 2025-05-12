import API from '../../../axiosConfig'

export async function getModules(token: string) {
	const response = await API.get('/modules/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function createModule(
	token: string,
	title: string,
	course_id: string
) {
	const response = await API.post(
		'/module/',
		{
			title: title,
			course_id: course_id,
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

export async function getModule(token: string, module_id: string) {
	const response = await API.get(`/modules/${module_id}/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		params: {
			module_id: module_id,
		},
	})

	return response.data
}

export async function editTitleModule(
	token: string,
	module_id: string,
	title: string
) {
	const response = await API.patch(
		`/modules/${module_id}/`,
		{
			title: title,
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

export async function deleteModule(token: string, item_id: string) {
	const response = await API.patch(
		`/modules/`,
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

export async function getModuleLessons(token: string, module_id: string) {
	const response = await API.get(`/modules/${module_id}/lessons/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		params: {
			module_id: module_id,
		},
	})

	return response.data
}
