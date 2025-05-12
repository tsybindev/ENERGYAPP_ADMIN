//@ts-ignore
//@ts-nocheck
import { makeAutoObservable } from 'mobx'
import Cookies from 'js-cookie'
import { Courses } from '@/lib/types/Courses'
import { getCourse, getCourses } from '@/lib/api/Courses'

class StoreCourse {
	isLoad = true
	courses: Courses[] | null = null
	course: Courses | null = null

	constructor() {
		makeAutoObservable(this, {
			setCourses: true,
			setCourse: true,
		})
	}

	async loading() {
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getCourses(token)
			this.setCourses(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	async getCourse(item_id: string) {
		// Проверяем, есть ли уже данные и совпадает ли id
		if (this.course && this.course.item_id === item_id) {
			return this.course
		}

		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getCourse(token, item_id)
			this.setCourse(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	setCourses(data: Courses[]) {
		this.courses = data
	}

	setCourse(data: Courses) {
		this.course = data
	}

	initializeCourse(courseData) {
		if (courseData) {
			this.course = courseData
			this.isLoad = false
		}
	}
}

const storeCourse = new StoreCourse()
export default storeCourse
