//@ts-ignore
//@ts-nocheck

import React, { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { Plus, Save, X } from 'lucide-react'
import { AskAddAnswerSchema } from '@/lib/schemas/AskAddAnswerSchema'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { editAsk } from '@/lib/api/Asks'
import StoreAsks from '@/lib/store/storeAsks'
import { observer } from 'mobx-react'

type ComponentProps = {
	module_id: string
	title: string
	ask_id: string
}

const AddAskAnswer = observer(({ ...props }: ComponentProps) => {
	const methods = useForm({
		resolver: zodResolver(AskAddAnswerSchema),
		defaultValues: {
			answers: [
				{
					title: '',
					is_input: false,
					is_true: false,
				},
			],
		},
	})

	// Подтягиваем данные из StoreAsks и обновляем форму при изменении данных
	useEffect(() => {
		const loadData = async () => {
			await StoreAsks.getAsk(props.ask_id) // Загружаем данные по ask_id
			if (StoreAsks.ask) {
				const answers = StoreAsks.ask.answers || [] // Пример: предполагаем, что данные в ask содержат поле answers
				methods.reset({ answers }) // Обновляем значения формы с помощью reset
			}
		}

		loadData()
	}, [props.ask_id, methods])

	const onSubmit: SubmitHandler<
		z.infer<typeof AskAddAnswerSchema>
	> = async data => {
		const { answers } = data

		// Преобразование данных, чтобы привести к нужному формату
		const formattedAnswers = answers.map(answer => ({
			title: answer.title,
			is_input: answer.is_input,
			is_true: answer.is_true,
		}))

		const toastId = toast.loading('Отправка данных...')

		try {
			const token = Cookies.get('users_access_token')
			await editAsk(
				token,
				props.module_id,
				props.ask_id,
				props.title,
				Boolean(answers[0]?.is_input),
				formattedAnswers
			)

			toast.success('Ответы успешно отправлены!', {
				id: toastId,
				duration: 5000,
				richColors: true,
				action: (
					<div className='absolute top-[10px] right-[10px]'>
						<X
							size={16}
							className='hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out'
							onClick={() => toast.dismiss()}
						/>
					</div>
				),
			})
		} catch (e) {
			toast.error('Ошибка при отправке данных', {
				id: toastId,
				duration: 5000,
				richColors: true,
				action: (
					<div className='absolute top-[10px] right-[10px]'>
						<X
							size={16}
							className='hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out'
							onClick={() => toast.dismiss()}
						/>
					</div>
				),
			})
		}
	}

	const handleRemoveAnswer = (index: number) => {
		const currentAnswers = methods.getValues('answers')
		const updatedAnswers = currentAnswers.filter((_, i) => i !== index)
		methods.setValue('answers', updatedAnswers)
	}

	return (
		<Form {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className='grid gap-4'>
				{/* Ответы */}
				{methods.watch('answers')?.map((_, index) => (
					<div key={index} className='grid gap-4'>
						<div className='p-4 mb-4 bg-white rounded-lg border border-gray-200 shadow-sm'>
							<div className='flex items-center justify-between mb-3 pb-2 border-b'>
								<div className='flex items-center'>
									<div className='flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 text-sm font-medium'>
										{index + 1}
									</div>
									<h4 className='font-medium text-primary'>Вариант ответа</h4>
								</div>
								<Button
									type='button'
									variant='outline'
									size='sm'
									className='text-red-500 border-red-200 hover:bg-red-50'
									onClick={() => handleRemoveAnswer(index)}
								>
									<X className='h-4 w-4 mr-1' />
									Удалить
								</Button>
							</div>

							{/* Название ответа */}
							<FormField
								control={methods.control}
								name={`answers[${index}].title`}
								render={({ field }) => (
									<FormItem className='mb-3'>
										<FormLabel className='text-sm text-gray-600'>
											Текст ответа
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type='text'
												placeholder='Введите текст ответа'
												required
												className='border-primary/20 focus:border-primary'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='flex flex-wrap gap-4 mt-3'>
								{/* Переключатель для is_input */}
								<FormField
									control={methods.control}
									name={`answers[${index}].is_input`}
									render={({ field }) => (
										<FormItem className='flex items-center space-x-2 rounded-lg border border-primary/20 p-3 bg-white w-auto min-w-[180px] max-w-[220px]'>
											<div className='space-y-0.5 flex-1'>
												<FormLabel className='text-sm font-medium'>
													Вводимый ответ
												</FormLabel>
											</div>
											<FormControl>
												<Switch
													{...field}
													className='border-2 border-primary/30 data-[state=unchecked]:bg-gray-200'
													checked={field.value}
													onCheckedChange={checked => field.onChange(checked)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Переключатель для is_true */}
								<FormField
									control={methods.control}
									name={`answers[${index}].is_true`}
									render={({ field }) => (
										<FormItem className='flex items-center space-x-2 rounded-lg border border-primary/20 p-3 bg-white w-auto min-w-[180px] max-w-[220px]'>
											<div className='space-y-0.5 flex-1'>
												<FormLabel className='text-sm font-medium'>
													Правильный ответ
												</FormLabel>
											</div>
											<FormControl>
												<Switch
													{...field}
													className='border-2 border-primary/30 data-[state=unchecked]:bg-gray-200'
													checked={field.value}
													onCheckedChange={checked => field.onChange(checked)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
				))}

				{/* Кнопка для добавления нового ответа, если is_input - false */}
				{!methods.watch('answers')?.[0]?.is_input && (
					<div className='bg-white rounded-lg border border-dashed border-primary/30 p-4 mb-4 flex justify-center'>
						<Button
							type='button'
							variant='outline'
							className='border-primary/20 text-primary hover:bg-primary/5'
							onClick={() =>
								methods.setValue('answers', [
									...methods.getValues('answers'),
									{ title: '', is_input: false, is_true: false },
								])
							}
						>
							<Plus className='h-4 w-4 mr-2' />
							Добавить вариант ответа
						</Button>
					</div>
				)}

				<Button
					type='submit'
					className='w-full bg-primary hover:bg-primary/90 text-white font-medium py-2'
				>
					<Save className='h-4 w-4 mr-2' />
					Сохранить ответы
				</Button>
			</form>
		</Form>
	)
})

export default AddAskAnswer
