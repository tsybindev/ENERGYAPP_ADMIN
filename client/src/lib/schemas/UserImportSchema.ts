import { z } from 'zod'

const UserSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	last_name: z.string(),
	first_name: z.string(),
	patronymic: z.string(),
	phone: z.string(),
	post: z.string(),
	snils: z.string(),
	birthday: z.string(),
	role: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	company_id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	status_foto: z.preprocess(
		val =>
			val === ''
				? undefined
				: val === 'true'
				? true
				: val === 'false'
				? false
				: val,
		z.boolean().optional()
	),
	reason: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	state_id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	date_create: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	date_save: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	date_check: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	admin_check_id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	is_active: z.preprocess(
		val =>
			val === ''
				? undefined
				: val === 'true'
				? true
				: val === 'false'
				? false
				: val,
		z.boolean().optional()
	),
	is_foto: z.preprocess(
		val =>
			val === ''
				? undefined
				: val === 'true'
				? true
				: val === 'false'
				? false
				: val,
		z.boolean().optional()
	),
})

export const UserImportSchema = z
	.array(UserSchema)
	.min(1, 'Должен быть хотя бы один пользователь')

export type UserImport = z.infer<typeof UserImportSchema>
