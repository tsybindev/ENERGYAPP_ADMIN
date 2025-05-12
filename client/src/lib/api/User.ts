import API from '../../../axiosConfig'

export async function login(email: string, password: string) {
	return await API.post('/login/', {
		email,
		password,
	})
}

export async function logout(token: string) {
	return await API.delete('/logout/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})
}

export async function getMe(user_id: string, token: string) {
	const response = await API.get(`/users/${user_id}/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}
