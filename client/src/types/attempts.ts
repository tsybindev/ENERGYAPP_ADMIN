export type AttemptPhoto = {
	foto: string
	screen: string
	date: string
}

export type Attempt = {
	id: string
	name: string
	photos: AttemptPhoto[]
}

export type Course = {
	id: string
	name: string
	attempts: {
		id: string
		date: string
		is_completed: boolean
	}[]
}

export type ApiUser = {
	last_name: string
	first_name: string
	patronymic: string
	phone: string
	post: string
	snils: string
	birthday: string
	role: string
	company_id: string
	status_foto: boolean
	reason: string
	state_id: string
	date_create: string
	date_save: string
	date_check: string
	admin_check_id: string
	is_active: boolean
	is_foto: boolean
	email: string
	item_id: string
}

export type ApiCourse = {
	count_children: number
	count_asks: number
	template_file: string
	image_menu: string
	image_main: string
	title: string
	post: string
	is_reg_number: boolean
	course_list_id: number
	item_id: string
	is_active: boolean
}

export type ApiAttempt = {
	item_id: string
	date_create: string
	is_completed: boolean
}

export type ApiAttemptPhoto = AttemptPhoto[]

export type ApiUserCourseAttempts = {
	course_id: string
	title: string
	exam: ApiAttempt[]
}
