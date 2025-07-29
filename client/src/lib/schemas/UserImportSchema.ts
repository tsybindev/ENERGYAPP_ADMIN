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
	role: z.string().optional(),
	company_id: z.string().optional(),
	status_foto: z.boolean().optional(),
	reason: z.string().optional(),
	state_id: z.string().optional(),
	date_create: z.string().optional(),
	date_save: z.string().optional(),
	date_check: z.string().optional(),
	admin_check_id: z.string().optional(),
	is_active: z.boolean().optional(),
	is_foto: z.boolean().optional(),
})

export const UserImportSchema = z
	.array(UserSchema)
	.min(1, 'Должен быть хотя бы один пользователь')

export type UserImport = z.infer<typeof UserImportSchema>;