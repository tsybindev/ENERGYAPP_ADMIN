//@ts-ignore
//@ts-nocheck

import React, { useEffect, useState } from 'react'

import { z } from 'zod'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { observer } from 'mobx-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
	ArrowLeft,
	Download,
	PanelLeft,
	Trash2,
	X,
	Edit,
	BookOpen,
	Info,
} from 'lucide-react'

import Head from 'next/head'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'
import { Input } from '@/components/ui/input'
import { Lessons } from '@/lib/types/Lessons'
import { Courses } from '@/lib/types/Courses'
import { Modules } from '@/lib/types/Modules'
import { checkType } from '@/lib/api/CheckType'
import { Button } from '@/components/ui/button'
import Editor from '@/components/elements/Editor'
import StoreModule from '@/lib/store/storeModules'
import StoreCatalog from '@/lib/store/storeCatalog'
import StoreLessons from '@/lib/store/storeLessons'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import AddLesson from '@/components/elements/AddLesson'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import ImageUpload from '@/components/elements/ImageUpload'
import { CourseAddSchema } from '@/lib/schemas/CourseAddSchema'
import { deleteLesson, editTitleLesson } from '@/lib/api/Lessons'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import {
	deleteModule,
	editTitleModule,
	getModule,
	getModuleLessons,
} from '@/lib/api/Modules'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const Lesson = observer(({ lesson }) => {
	const token = Cookies.get('users_access_token')
	const lessonId = lesson.item_id
	const router = useRouter()

	useEffect(() => {
		// Инициализируем store данными из SSR
		if (lesson) {
			StoreLessons.initializeLesson(lesson)
		}
	}, [lesson])

	useEffect(() => {
		if (lessonId) {
			StoreLessons.getLesson(lessonId).then()
		}
	}, [lessonId])

	const lessonData = StoreLessons.lesson

	const methods = useForm<z.infer<typeof CourseAddSchema>>({
		resolver: zodResolver(CourseAddSchema),
		defaultValues: { title: '' },
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

		const toastId = toast.loading('Изменение названия лекции...')

		try {
			const updatedLesson = await editTitleLesson(
				token,
				lessonData?.item_id,
				title
			)

			// Обновляем данные лекции в store напрямую
			StoreLessons.setLesson({
				...lessonData,
				title: title,
			})

			toast.success('Название лекции изменено!', {
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

			reset()

			// Обновляем каталог и лекцию в фоне
			StoreCatalog.loading().then()
			if (lessonId) {
				StoreLessons.getLesson(lessonId).then()
			}
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

	const handleDeleteLesson = async () => {
		const toastId = toast.loading('Удаление лекции...')

		try {
			const response = await deleteLesson(token, lessonData?.item_id)

			toast.success('Лекция удалена!', {
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

			await router.back()
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

	const [course, setCourse] = useState<Modules>()

	useEffect(() => {
		const fetchCourseLink = async () => {
			try {
				const response = await getModule(token, lessonData?.module_id) // Ожидаем завершения запроса
				setCourse(response) // Устанавливаем данные
			} catch (e) {
				console.log(e)
			}
		}
		if (lessonData?.module_id) {
			fetchCourseLink() // Вызываем асинхронную функцию
		}
	}, [token, lessonData?.module_id]) // Данные изменятся только при изменении token или module_id

	return (
		<>
			<Head>
				<title>ЭНЕРГИЯ - Лекции - {lessonData?.title}</title>
			</Head>

			<SidebarProvider>
				<AppSidebar />

				<SidebarInset>
					<header className='sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm'>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 flex items-center justify-center'
							onClick={router.back}
						>
							<ArrowLeft className='h-4 w-4' />
						</Button>

						<Separator orientation='vertical' className='mr-2 h-4' />

						<SidebarTrigger className='-ml-1 text-green-600 hover:text-green-700 hover:bg-green-50' />

						<Separator orientation='vertical' className='mr-2 h-4' />

						<div className='w-full flex flex-row justify-between items-center gap-4'>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink href='/'>Главная</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink href={`/course/${course?.course_id}`}>
											Курс
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink
											href={`/course/module/${lessonData?.module_id}`}
										>
											Модуль
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>{lessonData?.title}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<div className='flex flex-1 flex-col gap-6 p-6 bg-gray-50'>
						{/* Заголовок лекции с действиями */}
						<Card className='border-none shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<div>
									<CardTitle className='text-2xl font-bold text-primary'>
										{lessonData?.title}
									</CardTitle>
								</div>
								<div className='flex items-center gap-2'>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant='outline'
												size='icon'
												className='text-red-500 border-red-200 hover:bg-red-50'
											>
												<div className='flex-shrink-0 flex items-center justify-center w-8 h-8'>
													<Trash2 className='h-4 w-4' />
												</div>
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Подтвердите удаление
												</AlertDialogTitle>
												<AlertDialogDescription>
													Данное действие нельзя будет отменить
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Отмена</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDeleteLesson()}
													className={'bg-red-500 hover:bg-red-400'}
												>
													Удалить
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</CardHeader>
							<CardContent>
								<Form {...methods}>
									<form
										onSubmit={methods.handleSubmit(onSubmit)}
										className='flex items-end gap-4'
									>
										<FormField
											control={methods.control}
											name='title'
											render={({ field }) => (
												<FormItem className='flex-1'>
													<FormLabel>Название лекции</FormLabel>
													<div className='flex items-center gap-2'>
														<FormControl>
															<Input
																{...field}
																onChange={e => field.onChange(e.target.value)}
																type={'text'}
																placeholder={'Введите новое название лекции'}
																required
																className='border-primary/20 focus:border-primary'
															/>
														</FormControl>
														<Button
															type='submit'
															size='sm'
															className='flex-shrink-0'
														>
															<Edit className='h-4 w-4 mr-1' />
															Обновить
														</Button>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									</form>
								</Form>
							</CardContent>
						</Card>

						{/* Контент лекции */}
						<div className='pt-4 pb-0 bg-gray-50'>
							<Card className='border-none shadow-md'>
								<div className='sticky top-16 z-10 bg-white rounded-t-lg'>
									<CardHeader className='flex flex-row items-center justify-between pb-2'>
										<div>
											<CardTitle className='text-xl flex items-center gap-2'>
												<BookOpen className='h-5 w-5 text-blue-500' />
												Содержание лекции
											</CardTitle>
											<CardDescription>
												Редактор контента лекции
											</CardDescription>
										</div>
									</CardHeader>
								</div>

								<CardContent className='p-4'>
									<Editor
										token={token}
										title={lessonData?.title}
										lesson_id={lessonData?.item_id}
										initialContent={lessonData?.content.text}
									/>
								</CardContent>
							</Card>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	)
})

export default Lesson

export async function getServerSideProps({ params, req, res }) {
	const lesson = await checkType('lesson', params.slug, { req, res })

	if (!lesson) {
		return { notFound: true }
	}

	return { props: { lesson } }
}
