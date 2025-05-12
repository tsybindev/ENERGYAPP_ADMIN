import { makeAutoObservable } from 'mobx'
import Cookies from 'js-cookie'
import { Course } from '@/types/attempts'
import { getUsers, getUserAttempts } from '@/lib/api/Users'

class StoreAttempts {
	isLoad = true
	users: { id: string; name: string; email: string }[] = []
	userCourses: Course[] = []
	loading = false
	error: string | null = null

	constructor() {
		makeAutoObservable(this, {
			setUsers: true,
			setUserCourses: true,
			setLoading: true,
			setError: true,
		})
	}

	async loadUsers() {
		try {
			this.setLoading(true)
			this.setError(null)
			const token = Cookies.get('users_access_token')
			if (!token) {
				throw new Error('No token found')
			}

			const users = await getUsers(token)
			const clients = users.filter(user => user.role === 'client')
			this.setUsers(
				clients.map(user => ({
					id: user.item_id,
					name: `${user.last_name} ${user.first_name} ${user.patronymic}`,
					email: user.email,
				}))
			)
		} catch (error) {
			this.setError('Ошибка при загрузке пользователей')
			console.error(error)
		} finally {
			this.setLoading(false)
		}
	}

	async loadUserCourses(userId: string) {
		try {
			this.setLoading(true)
			this.setError(null)
			const token = Cookies.get('users_access_token')
			if (!token) {
				throw new Error('No token found')
			}

			const attempts = await getUserAttempts(token, userId)
			this.setUserCourses(
				attempts.map(course => ({
					id: course.course_id,
					name: course.title,
					attempts: course.exam.map(attempt => ({
						id: attempt.item_id,
						date: attempt.date_create,
					})),
				}))
			)
		} catch (error) {
			this.setError('Ошибка при загрузке курсов пользователя')
			console.error(error)
		} finally {
			this.setLoading(false)
		}
	}

	setUsers(users: { id: string; name: string; email: string }[]) {
		this.users = users
	}

	setUserCourses(courses: Course[]) {
		this.userCourses = courses
	}

	setLoading(loading: boolean) {
		this.loading = loading
	}

	setError(error: string | null) {
		this.error = error
	}
}

const storeAttempts = new StoreAttempts()
export default storeAttempts
