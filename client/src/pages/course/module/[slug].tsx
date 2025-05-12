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
import { Asks } from '@/lib/types/Asks'
import { getAsks } from '@/lib/api/Asks'
import { Input } from '@/components/ui/input'
import { Modules } from '@/lib/types/Modules'
import { Lessons } from '@/lib/types/Lessons'
import { checkType } from '@/lib/api/CheckType'
import { Button } from '@/components/ui/button'
import StoreCourse from '@/lib/store/storeCourse'
import AddAsk from '@/components/elements/AddAsk'
import StoreModule from '@/lib/store/storeModules'
import StoreCatalog from '@/lib/store/storeCatalog'
import StoreLessons from '@/lib/store/storeLessons'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import AddModule from '@/components/elements/AddModule'
import AddLesson from '@/components/elements/AddLesson'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import ImageUpload from '@/components/elements/ImageUpload'
import { CourseAddSchema } from '@/lib/schemas/CourseAddSchema'
import {
	deleteModule,
	editTitleModule,
	getModuleLessons,
} from '@/lib/api/Modules'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
	createCourse,
	deleteCourse,
	editTitleCourse,
	getCourse,
	getCourseModules,
	uploadCourseImage,
	uploadCourseTemplate,
} from '@/lib/api/Courses'
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

const Module = observer(({ module }) => {
	const token = Cookies.get('users_access_token')
	const moduleId = module.item_id
	const [loadingLessons, setLoadingLessons] = useState<boolean>(false)
	const [loadingAsks, setLoadingAsks] = useState<boolean>(false)

	const router = useRouter()

	useEffect(() => {
		// Инициализируем store данными из SSR
		if (module) {
			StoreModule.initializeModule(module)
		}
	}, [module])

	useEffect(() => {
		if (moduleId) {
			StoreModule.getModule(moduleId).then()
		}
	}, [moduleId])

	const moduleData = StoreModule.module

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

		const toastId = toast.loading('Изменение названия модуля...')

		try {
			await editTitleModule(token, moduleId, title)

			toast.success('Название модуля изменено!', {
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
			if (moduleId) {
				StoreModule.getModule(moduleId).then()
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

	const handleDeleteModule = async () => {
		const toastId = toast.loading('Удаление модуля...')

		try {
			const response = await deleteModule(token, moduleId)

			toast.success('Модуль удален!', {
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

	const [lessons, setLessons] = useState<Lessons[]>([])

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				const response = await getModuleLessons(token, moduleId) // Ожидаем завершения запроса
				setLessons(response) // Устанавливаем данные
			} catch (e) {
				console.error('Ошибка при загрузке модулей:', e) // Логируем ошибку
			}
		}

		fetchLessons() // Вызываем асинхронную функцию
	}, [token, moduleId]) // Данные изменятся только при изменении token или moduleId

	const [asks, setAsks] = useState<Asks[]>([])

	useEffect(() => {
		const fetchAsks = async () => {
			try {
				const response = await getAsks(token, moduleId) // Ожидаем завершения запроса
				setAsks(response) // Устанавливаем данные
			} catch (e) {
				console.error('Ошибка при загрузке модулей:', e) // Логируем ошибку
			}
		}

		fetchAsks() // Вызываем асинхронную функцию
	}, [token, moduleId]) // Данные изменятся только при изменении token или courseId

	return (
		<>
			<Head>
				<title>ЭНЕРГИЯ - Модули - {moduleData?.title}</title>
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
										<BreadcrumbLink href={`/course/${moduleData?.course_id}`}>
											Курс
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>{moduleData?.title}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>
					<div className='flex flex-1 flex-col gap-4 p-4'>
						<div className='grid auto-rows-min gap-4 md:grid-cols-1'>
							<div className='rounded-xl bg-muted/50 p-4 flex flex-row gap-4 justify-between'>
								<p className={'text-xl text-primary font-semibold'}>
									{moduleData?.title}
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
												onClick={() => handleDeleteModule()}
												className={'bg-red-500 hover:bg-red-400'}
											>
												Удалить
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>

						<div className={'grid grid-cols-2 gap-4'}>
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
														<FormLabel>Название модуля</FormLabel>
														<FormControl>
															<Input
																{...field}
																onChange={e => field.onChange(e.target.value)}
																type={'text'}
																placeholder={'Название модуля'}
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
								</div>
							</div>

							<div className={'flex flex-col gap-4'}>
								<div
									className={
										'col-span-2 lg:col-span-1 rounded-xl bg-muted/50 md:min-h-min p-4 flex flex-col gap-4'
									}
								>
									<Accordion type='single' collapsible>
										<AccordionItem value='item-1'>
											<AccordionTrigger
												className={'text-lg font-semibold text-primary'}
											>
												Список лекций
											</AccordionTrigger>
											<AccordionContent>
												<div className={'w-full flex flex-col gap-2'}>
													{lessons.length ? (
														lessons.map(lesson => (
															<Link
																href={
																	loadingLessons || loadingAsks
																		? '#'
																		: `/course/module/lesson/${lesson.item_id}`
																}
																key={lesson.item_id}
																onClick={e => {
																	if (loadingLessons) {
																		e.preventDefault()
																		return
																	}
																	setLoadingLessons(true)
																}}
																className={cn(
																	'p-2 rounded-sm transition ease-in-out duration-300 hover:bg-gray-200',
																	(loadingLessons || loadingAsks) &&
																		'opacity-50 cursor-not-allowed'
																)}
															>
																<p>{lesson.title}</p>
															</Link>
														))
													) : (
														<p>Лекции не найдены</p>
													)}
												</div>
											</AccordionContent>
										</AccordionItem>
									</Accordion>

									<AddLesson module_id={moduleId} />
								</div>

								<div
									className={
										'col-span-2 lg:col-span-1 rounded-xl bg-muted/50 md:min-h-min p-4 flex flex-col gap-4'
									}
								>
									<Accordion type='single' collapsible>
										<AccordionItem value='item-1'>
											<AccordionTrigger
												className={'text-lg font-semibold text-primary'}
											>
												Список вопросов
											</AccordionTrigger>
											<AccordionContent>
												<div className={'w-full flex flex-col gap-2'}>
													{asks.length ? (
														asks.map(ask => (
															<Link
																href={
																	loadingAsks || loadingLessons
																		? '#'
																		: `/course/module/ask/${ask.item_id}`
																}
																key={ask.item_id}
																onClick={e => {
																	if (loadingAsks) {
																		e.preventDefault()
																		return
																	}
																	setLoadingAsks(true)
																}}
																className={cn(
																	'p-2 rounded-sm transition ease-in-out duration-300 hover:bg-gray-200',
																	(loadingLessons || loadingAsks) &&
																		'opacity-50 cursor-not-allowed'
																)}
															>
																<p>{ask.title}</p>
															</Link>
														))
													) : (
														<p>Вопросы не найдены</p>
													)}
												</div>
											</AccordionContent>
										</AccordionItem>
									</Accordion>

									<AddAsk module_id={moduleId} />
								</div>
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	)
})

export default Module

export async function getServerSideProps({ params, req, res }) {
	const module = await checkType('module', params.slug, { req, res })

	if (!module) {
		return { notFound: true }
	}

	return { props: { module } }
}
