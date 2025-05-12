//@ts-ignore
//@ts-nocheck

import { Catalog } from '@/lib/types/Catalogs'
import { makeAutoObservable } from 'mobx'
import { getCatalog } from '@/lib/api/Catalogs'
import Cookies from 'js-cookie'
import { Courses } from '@/lib/types/Courses'
import { getCourse, getCourses } from '@/lib/api/Courses'
import { Modules } from '@/lib/types/Modules'
import { getModule, getModules } from '@/lib/api/Modules'
import { Lessons } from '@/lib/types/Lessons'
import { getLesson, getLessons } from '@/lib/api/Lessons'

class StoreLessons {
	isLoad = true
	lessons: Lessons[] | null = null
	lesson: Lessons | null = null

	constructor() {
		makeAutoObservable(this, {
			setLessons: true,
			setLesson: true,
		})
	}

	async loading() {
		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getLessons(token)
			this.setLessons(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	async getLesson(item_id: string) {
		// Проверяем, есть ли уже данные и совпадает ли id
		if (this.lesson && this.lesson.item_id === item_id) {
			return this.lesson
		}

		const token = Cookies.get('users_access_token')
		this.isLoad = true
		try {
			const data = await getLesson(token, item_id)
			this.setLesson(data)
			this.isLoad = false
		} catch (e) {
			console.log(e)
			this.isLoad = false
		}
	}

	setLessons(data: Lessons[]) {
		this.lessons = data
	}

	setLesson(data: Lessons) {
		this.lesson = data
	}

	initializeLesson(lessonData) {
		if (lessonData) {
			this.lesson = lessonData
			this.isLoad = false
		}
	}
}

const storeLessons = new StoreLessons()
export default storeLessons
