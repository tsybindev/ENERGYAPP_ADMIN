import { z } from 'zod'

const AnswerSchema = z.object({
	content: z.record(z.any()).default({}),
	title: z.string(),
	is_input: z.boolean().default(false),
	is_true: z.boolean().default(false),
})

const AskSchema = z.object({
	title: z.string(),
	content: z.record(z.any()).default({}),
	is_input: z.boolean().default(false),
	answers: z.array(AnswerSchema).min(1, 'Должен быть хотя бы один ответ'),
})

export const AskImportSchema = z
	.array(AskSchema)
	.min(1, 'Должен быть хотя бы один вопрос')
