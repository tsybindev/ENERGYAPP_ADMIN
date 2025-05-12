import API from '../../../axiosConfig'

export async function createAsk(
	token: string,
	module_id: string,
	title?: string,
	is_input?: boolean,
	answers?: any
) {
	const response = await API.post(
		`/modules/${module_id}/test/ask/`,
		{
			title: title,
			is_input: is_input,
			answers: answers,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			params: {
				module_id: module_id,
			},
		}
	)

	return response.data
}

export async function deleteAsk(
	token: string,
	module_id: string,
	item_id: string
) {
	const response = await API.patch(
		`/modules/${module_id}/test/asks/`,
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

export async function getAsks(token: string, module_id: string) {
	const response = await API.get(`/modules/${module_id}/test/asks/`, {
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

export async function getAsk(token: string, ask_id: string) {
	const response = await API.get(`/asks/${ask_id}/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function editTitleAsk(
	token: string,
	module_id: string,
	ask_id: string,
	title: string
) {
	const response = await API.patch(
		`/modules/${module_id}/test/asks/${ask_id}/`,
		{
			title: title,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			params: {
				module_id: module_id,
				ask_id: ask_id,
			},
		}
	)

	return response.data
}

export async function editAsk(
	token: string,
	module_id: string,
	ask_id: string,
	title: string,
	is_input?: boolean,
	answers?: any
) {
	const response = await API.patch(
		`/modules/${module_id}/test/asks/${ask_id}/`,
		{
			title: title,
			is_input: is_input,
			answers: answers,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			params: {
				module_id: module_id,
				ask_id: ask_id,
			},
		}
	)

	return response.data
}
