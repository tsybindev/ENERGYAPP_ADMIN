//@ts-ignore
//@ts-nocheck

import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { checkType } from '@/lib/api/CheckType'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
// Удален импорт Profile
import {
	createCourse,
	deleteCourse,
	editTitleCourse,
	getCourse,
	getCourseModules,
	uploadCourseImage,
	uploadCourseTemplate,
} from '@/lib/api/Courses'
import Cookies from 'js-cookie'
import Head from 'next/head'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CourseAddSchema } from '@/lib/schemas/CourseAddSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Download, Trash2, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import StoreCourse from '@/lib/store/storeCourse'
import ImageUpload from '@/components/elements/ImageUpload'
import Link from 'next/link'
import { Modules } from '@/lib/types/Modules'
import AddModule from '@/components/elements/AddModule'
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
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'

const Course = observer(({ course }) => {
	const token = Cookies.get('users_access_token')
	const courseId = course.item_id
	const [loadingModules, setLoadingModules] = useState<boolean>(false)

	const router = useRouter()

	useEffect(() => {
		// Инициализируем store данными из SSR
		if (course) {
			StoreCourse.initializeCourse(course)
		}
	}, [course])

	useEffect(() => {
		if (courseId) {
			StoreCourse.getCourse(courseId).then()
		}
	}, [courseId])

	const courseData = StoreCourse.course
	const imageMainType = 'main'
	const imageMenuType = 'menu'

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

		const toastId = toast.loading('Изменение названия курса...')

		try {
			const token = Cookies.get('users_access_token')
			await editTitleCourse(token, courseId, title)

			toast.success('Название курса изменено!', {
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
			if (courseData) {
				StoreCourse.getCourse(courseId).then()
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

	const uploadMainImageFunction = (data: any) => {
		return uploadCourseImage(
			token,
			courseData?.item_id,
			'main',
			data.file,
			data.fileName
		)
	}

	const uploadMenuImageFunction = (data: any) => {
		return uploadCourseImage(
			token,
			courseData?.item_id,
			'menu',
			data.file,
			data.fileName
		)
	}

	const uploadTemplateFunction = (data: any) => {
		return uploadCourseTemplate(
			token,
			courseData?.item_id,
			data.file,
			data.fileName
		)
	}

	const requestMainImageData = (file: File) => ({
		token,
		courseId,
		imageMainType,
		file,
		fileName: file.name,
	})

	const requestMenuImageData = (file: File) => ({
		token,
		courseId,
		imageMenuType,
		file,
		fileName: file.name,
	})

	const requestTemplateData = (file: File) => ({
		token,
		courseId,
		imageMenuType,
		file,
		fileName: file.name,
	})

	const handleStoreUpdate = (response: any) => {
		if (courseId) {
			StoreCourse.getCourse(courseId).then()
		}
	}

	const [modules, setModule] = useState<Modules[]>([])

	useEffect(() => {
		const fetchModules = async () => {
			try {
				const response = await getCourseModules(token, courseId) // Ожидаем завершения запроса
				setModule(response) // Устанавливаем данные
			} catch (e) {
				console.error('Ошибка при загрузке модулей:', e) // Логируем ошибку
			}
		}

		fetchModules() // Вызываем асинхронную функцию
	}, [token, courseId]) // Данные изменятся только при изменении token или courseId

	const handleDeleteCourse = async () => {
		const toastId = toast.loading('Удаление курса...')

		try {
			const response = await deleteCourse(token, courseId)

			toast.success('Курс удален!', {
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

			await router.push('/')
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
		<>
			<Head>
				<title>ЭНЕРГИЯ - Курсы - {courseData?.title}</title>
			</Head>

			<SidebarProvider>
				<AppSidebar />

				<SidebarInset>
					<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
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
									<BreadcrumbItem>
										<BreadcrumbPage>{courseData?.title}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>

					<div className='flex flex-1 flex-col gap-4 p-4'>
						<div className='grid auto-rows-min gap-4 md:grid-cols-1'>
							<div className='rounded-xl bg-muted/50 p-4 flex flex-row gap-4 justify-between'>
								<p className={'text-xl text-primary font-semibold'}>
									{courseData?.title}
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
												onClick={() => handleDeleteCourse()}
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
												Сменить название
											</Button>
										</form>
									</Form>

									<Separator />

									<div className={'flex flex-col gap-4'}>
										<p className={'text-lg font-semibold text-primary'}>
											Главная картинка
										</p>
										<div
											className={
												'flex flex-col lg:flex-row items-center justify-center gap-4'
											}
										>
											{courseData?.image_main ? (
												<img
													src={`${process.env.NEXT_PUBLIC_API_URL}${courseData?.image_main}`}
													className={
														'max-w-[256px] lg:max-w-[50%] w-full h-auto p-1 border border-primary border-solid rounded-xl'
													}
													alt={''}
												/>
											) : null}

											<ImageUpload
												uploadFunction={uploadMainImageFunction}
												storeAction={handleStoreUpdate}
												requestData={requestMainImageData}
											/>
										</div>
									</div>

									<Separator />

									<div className={'flex flex-col gap-4'}>
										<p className={'text-lg font-semibold text-primary'}>
											Изображение для меню
										</p>
										<div
											className={
												'flex flex-col lg:flex-row items-center justify-center gap-4'
											}
										>
											{courseData?.image_menu ? (
												<img
													src={`${process.env.NEXT_PUBLIC_API_URL}${courseData?.image_menu}`}
													className={
														'max-w-[256px] lg:max-w-[50%] w-full h-auto p-1 border border-primary border-solid rounded-xl'
													}
													alt={''}
												/>
											) : null}

											<ImageUpload
												uploadFunction={uploadMenuImageFunction}
												storeAction={handleStoreUpdate}
												requestData={requestMenuImageData}
											/>
										</div>
									</div>

									<Separator />

									<div className={'flex flex-col gap-4'}>
										<p className={'text-lg font-semibold text-primary'}>
											Шаблон протокола
										</p>
										<div
											className={
												'flex flex-col lg:flex-row items-center justify-center gap-4'
											}
										>
											{courseData?.template_file ? (
												<Link
													target={'_blank'}
													href={`${process.env.NEXT_PUBLIC_API_URL}${courseData?.template_file}`}
													className={
														'max-w-[256px] lg:max-w-[50%] w-full flex flex-col gap-1 text-primary underline items-center transition ease-in-out duration-300 hover:bg-gray-200 p-2 rounded-sm'
													}
												>
													<Download />
													<p className={'leading-none'}>Скачать файл</p>
												</Link>
											) : null}

											<ImageUpload
												uploadFunction={uploadTemplateFunction}
												storeAction={handleStoreUpdate}
												requestData={requestTemplateData}
											/>
										</div>
									</div>
								</div>
							</div>

							<div className='col-span-2 lg:col-span-1 rounded-xl bg-muted/50 md:min-h-min p-4 flex flex-col gap-4'>
								<p className={'text-lg font-semibold text-primary'}>
									Список модулей
								</p>

								<Separator />

								<div className={'w-full flex flex-col gap-2'}>
									{modules.length ? (
										modules.map(module => (
											<Link
												href={
													loadingModules
														? '#'
														: `/course/module/${module.item_id}`
												}
												onClick={e => {
													if (loadingModules) {
														e.preventDefault()
														return
													}
													setLoadingModules(true)
												}}
												key={module.item_id}
												className={cn(
													'p-2 rounded-sm transition ease-in-out duration-300 hover:bg-gray-200',
													loadingModules && 'opacity-50 cursor-not-allowed'
												)}
											>
												<p>{module.title}</p>
											</Link>
										))
									) : (
										<p>Модулей не найдено</p>
									)}
								</div>

								<Separator />

								<AddModule course_id={courseId} />
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	)
})

export default Course

export async function getServerSideProps({ params, req, res }) {
	const course = await checkType('course', params.slug, { req, res })

	if (!course) {
		return { notFound: true }
	}

	return { props: { course } }
}
