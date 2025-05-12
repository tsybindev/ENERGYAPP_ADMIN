import API from '../../../axiosConfig'
import { ApiCourse } from '@/types/attempts'

export async function createCourse(token: string, title: string) {
	const response = await API.post(
		'/course/',
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

export async function editTitleCourse(
	token: string,
	course_id: string,
	title: string
) {
	const response = await API.patch(
		`/courses/${course_id}/`,
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

export async function getCourses(token: string) {
	const response = await API.get<ApiCourse[]>('/courses/', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function getCourse(token: string, item_id: string) {
	const response = await API.get(`/courses/${item_id}/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	return response.data
}

export async function uploadCourseImage(
	token: string,
	course_id: string,
	image_type: 'menu' | 'main',
	file: File, // Принимает файл напрямую
	file_name: string
) {
	// Создаем объект FormData
	const formData = new FormData()
	formData.append('file_bytes', file) // Ключ для передачи байтов файла
	formData.append('file_name', file_name) // Название файла

	// Отправляем запрос через axios
	const response = await API.patch(
		`/courses/${course_id}/image/${image_type}/`,
		formData,
		{
			params: {
				course_id: course_id,
				image_type: image_type,
				file_name: file_name,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function uploadCourseTemplate(
	token: string,
	course_id: string,
	file: File,
	file_name: string
) {
	// Создаем объект FormData
	const formData = new FormData()
	formData.append('file_bytes', file) // Ключ для передачи байтов файла
	formData.append('file_name', file_name) // Название файла

	// Отправляем запрос через axios
	const response = await API.patch(
		`/courses/${course_id}/template/`,
		formData,
		{
			params: {
				course_id: course_id,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	)

	return response.data
}

export async function getCourseModules(token: string, course_id: string) {
	const response = await API.get(`/courses/${course_id}/modules/`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		params: {
			course_id: course_id,
		},
	})

	return response.data
}

export async function deleteCourse(token: string, item_id: string) {
	const response = await API.patch(
		`/courses/`,
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
