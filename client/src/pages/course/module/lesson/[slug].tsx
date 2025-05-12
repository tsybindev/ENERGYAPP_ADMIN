//@ts-ignore
//@ts-nocheck

import React, { useEffect, useState } from 'react'

import { z } from 'zod'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { observer } from 'mobx-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ArrowLeft, Download, PanelLeft, Trash2, X } from 'lucide-react'

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
			await editTitleLesson(token, lessonData?.item_id, title)

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
					<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
						<Button
							variant='ghost'
							size='icon'
							className={cn('h-7 w-7 flex items-center justify-center')}
							onClick={router.back}
						>
							<ArrowLeft
								className={cn(
									'z-20 hidden w-4 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
									'[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
									'[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
									'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
									'[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
									'[[data-side=right][data-collapsible=offcanvas]_&]:-left-2'
								)}
							/>
						</Button>

						<Separator orientation='vertical' className='mr-2 h-4' />

						<SidebarTrigger className='-ml-1' />

						<Separator orientation='vertical' className='mr-2 h-4' />

						<div
							className={
								'w-full flex flex-row justify-between items-center gap-4'
							}
						>
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
					<div className='flex flex-1 flex-col gap-4 p-4'>
						<div className='grid auto-rows-min gap-4 md:grid-cols-1'>
							<div className='rounded-xl bg-muted/50 p-4 flex flex-row gap-4 justify-between'>
								<p className={'text-xl text-primary font-semibold'}>
									{lessonData?.title}
								</p>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Trash2
											className={
												'text-primary transition ease-in-out duration-300 hover:text-red-500 cursor-pointer'
											}
										/>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
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
						</div>

						<div className='grid auto-rows-min gap-4 md:grid-cols-1'>
							<div className='col-span-2 lg:col-span-1 rounded-xl bg-muted/50 md:min-h-min p-4 flex flex-col gap-4'>
								<div className={'w-full flex flex-col gap-4'}>
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
														<FormLabel>Название лекции</FormLabel>
														<FormControl>
															<Input
																{...field}
																onChange={e => field.onChange(e.target.value)}
																type={'text'}
																placeholder={'Название лекции'}
																required
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<Button type='submit' className='w-full'>
												Сменить название
											</Button>
										</form>
									</Form>

									<Separator />

									<Editor
										token={token}
										title={lessonData?.title}
										lesson_id={lessonData?.item_id}
										initialContent={lessonData?.content.text}
									/>
								</div>
							</div>
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
