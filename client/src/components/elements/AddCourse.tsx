//@ts-ignore
//@ts-nocheck

import React from 'react'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CourseAddSchema } from '@/lib/schemas/CourseAddSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createCourse } from '@/lib/api/Courses'
import Cookies from 'js-cookie'
import { X } from 'lucide-react'
import StoreCatalog from '@/lib/store/storeCatalog'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'

const AddCourse = () => {
	const router = useRouter()

	const methods = useForm<z.infer<typeof CourseAddSchema>>({
		resolver: zodResolver(CourseAddSchema),
		defaultValues: {},
	})

	const {
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = methods

	const onSubmit: SubmitHandler<z.infer<CourseAddSchema>> = async data => {
		const { title } = data

		const toastId = toast.loading('Создание курса...')

		try {
			const token = Cookies.get('users_access_token')
			const response = await createCourse(token, title)

			toast.success('Курс добавлен успешно!', {
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

			StoreCatalog.loading().then()
			await router.push(`/course/${response.item_id}`)
		} catch (e) {
			toast.error(httpErrorsSplit(e), {
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

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Добавить курс</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Добавить курс</SheetTitle>
				</SheetHeader>
				<div className='grid gap-4 py-4'>
					<Form {...methods}>
						<form
							onSubmit={methods.handleSubmit(onSubmit)}
							className='grid gap-4'
						>
							<FormField
								control={methods.control}
								name='title'
								render={({ field }) => (
									<FormItem className='grid gap-2'>
										<FormLabel>Название курса</FormLabel>
										<FormControl>
											<Input
												{...field}
												onChange={e => field.onChange(e.target.value)}
												type={'text'}
												placeholder={'Название курса'}
												required
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type='submit' className='w-full'>
								Добавить курс
							</Button>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default AddCourse
