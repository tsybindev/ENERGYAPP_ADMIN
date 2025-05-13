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
import {
	Download,
	Trash2,
	X,
	Edit,
	FileText,
	Image as ImageIcon,
	FileUp,
	CheckCircle,
	Clock,
	Info,
	ArrowLeft,
} from 'lucide-react'
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
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

import ImagePreview from '@/components/elements/ImagePreview'
import ModuleCard from '@/components/elements/ModuleCard'

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
			const response = await editTitleCourse(token, courseId, title)

			// Обновляем данные курса в store напрямую
			if (response && courseData) {
				// Обновляем данные курса в store
				StoreCourse.setCourse({
					...courseData,
					title: title,
				})
			}

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

			// Обновляем каталог и данные курса асинхронно
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
	const [isModulesLoading, setIsModulesLoading] = useState<boolean>(true)

	useEffect(() => {
		const fetchModules = async () => {
			setIsModulesLoading(true)
			try {
				const response = await getCourseModules(token, courseId) // Ожидаем завершения запроса
				setModule(response) // Устанавливаем данные
			} catch (e) {
				console.error('Ошибка при загрузке модулей:', e) // Логируем ошибку
			} finally {
				setIsModulesLoading(false)
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
					<header className='sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm'>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 flex items-center justify-center'
							onClick={router.back}
						>
							<ArrowLeft className='h-4 w-4 text-green-600 hover:text-green-700 hover:bg-green-50' />
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
									<BreadcrumbItem>
										<BreadcrumbPage>Просмотр курса</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>

					<div className='flex flex-1 flex-col gap-6 p-6 bg-gray-50'>
						{/* Заголовок курса с действиями */}
						<Card className='border-none shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<div>
									<CardTitle className='text-2xl font-bold text-primary'>
										{courseData?.title}
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
													onClick={() => handleDeleteCourse()}
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
													<FormLabel>Название курса</FormLabel>
													<div className='flex items-center gap-2'>
														<FormControl>
															<Input
																{...field}
																onChange={e => field.onChange(e.target.value)}
																type={'text'}
																placeholder={'Введите новое название курса'}
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

						{/* Модули курса */}
						<div className='pt-4 pb-0 bg-gray-50'>
							<Card className='border-none shadow-md'>
								<div className='sticky top-16 z-10 bg-white rounded-t-lg'>
									<CardHeader className='flex flex-row items-center justify-between pb-2'>
										<div>
											<CardTitle className='text-xl flex items-center gap-2'>
												<FileText className='h-5 w-5 text-primary' />
												Модули курса
											</CardTitle>
											<CardDescription>
												Управление модулями и их содержимым
											</CardDescription>
										</div>
										<div>
											<AddModule course_id={courseId} />
										</div>
									</CardHeader>
								</div>

								<CardContent className='p-0'>
									{isModulesLoading ? (
										<div className='flex flex-col items-center justify-center py-8 text-center'>
											<div className='h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-2'></div>
											<p className='text-gray-500 mb-4'>Загрузка модулей...</p>
										</div>
									) : modules.length > 0 ? (
										<div className='grid gap-3 p-4 pt-2'>
											{modules.map(module => (
												<ModuleCard
													key={module.item_id}
													module={module}
													isLoading={loadingModules}
													onNavigate={() => setLoadingModules(true)}
												/>
											))}
										</div>
									) : (
										<div className='flex flex-col items-center justify-center py-8 text-center'>
											<Info className='h-12 w-12 text-gray-300 mb-2' />
											<p className='text-gray-500 mb-4'>
												Модулей пока не добавлено
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Изображения и шаблон */}
						<div className='sticky top-16 z-20 bg-gray-50 pt-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{/* Главное изображение */}
								<Card className='h-full relative bg-white'>
									<CardHeader className='pb-2 bg-white rounded-t-lg'>
										<CardTitle className='text-base flex items-center gap-2'>
											<ImageIcon className='h-4 w-4 text-primary' />
											Главное изображение
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-3'>
										<div className='flex flex-col gap-3'>
											<div className='w-full'>
												{courseData?.image_main ? (
													<ImagePreview
														src={`${process.env.NEXT_PUBLIC_API_URL}${courseData?.image_main}`}
														alt={courseData?.title}
														className='w-full h-auto object-cover max-h-[150px]'
													/>
												) : (
													<div className='w-full h-[150px] bg-gray-100 rounded-lg flex items-center justify-center'>
														<p className='text-gray-400 text-sm'>
															Изображение не загружено
														</p>
													</div>
												)}
											</div>
											<div className='w-full'>
												<ImageUpload
													uploadFunction={uploadMainImageFunction}
													storeAction={handleStoreUpdate}
													requestData={requestMainImageData}
													title='Загрузить главное изображение'
												/>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Изображение для меню */}
								<Card className='h-full relative bg-white'>
									<CardHeader className='pb-2 bg-white rounded-t-lg'>
										<CardTitle className='text-base flex items-center gap-2'>
											<ImageIcon className='h-4 w-4 text-primary' />
											Изображение для меню
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-3'>
										<div className='flex flex-col gap-3'>
											<div className='w-full'>
												{courseData?.image_menu ? (
													<ImagePreview
														src={`${process.env.NEXT_PUBLIC_API_URL}${courseData?.image_menu}`}
														alt={`${courseData?.title} - меню`}
														className='w-full h-auto object-cover max-h-[150px]'
													/>
												) : (
													<div className='w-full h-[150px] bg-gray-100 rounded-lg flex items-center justify-center'>
														<p className='text-gray-400 text-sm'>
															Изображение не загружено
														</p>
													</div>
												)}
											</div>
											<div className='w-full'>
												<ImageUpload
													uploadFunction={uploadMenuImageFunction}
													storeAction={handleStoreUpdate}
													requestData={requestMenuImageData}
													title='Загрузить изображение для меню'
												/>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Шаблон протокола */}
								<Card className='h-full relative bg-white'>
									<CardHeader className='pb-2 bg-white rounded-t-lg'>
										<CardTitle className='text-base flex items-center gap-2'>
											<FileUp className='h-4 w-4 text-primary' />
											Шаблон протокола
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-3'>
										<div className='flex flex-col gap-3'>
											<div className='w-full'>
												{courseData?.template_file ? (
													<Link
														target={'_blank'}
														href={`${process.env.NEXT_PUBLIC_API_URL}${courseData?.template_file}`}
														className='flex flex-col items-center justify-center p-4 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all duration-300 h-[150px]'
													>
														<FileText className='h-10 w-10 text-primary mb-2' />
														<p className='font-medium text-primary text-sm'>
															Шаблон протокола
														</p>
														<div className='flex items-center gap-1 mt-1 text-xs text-primary/70'>
															<Download className='h-3 w-3' />
															<span>Скачать файл</span>
														</div>
													</Link>
												) : (
													<div className='w-full h-[150px] bg-gray-100 rounded-lg flex items-center justify-center'>
														<p className='text-gray-400 text-sm'>
															Файл не загружен
														</p>
													</div>
												)}
											</div>
											<div className='w-full'>
												<ImageUpload
													uploadFunction={uploadTemplateFunction}
													storeAction={handleStoreUpdate}
													requestData={requestTemplateData}
													title='Загрузить шаблон протокола'
													isDocument={true}
												/>
											</div>
										</div>
									</CardContent>
								</Card>
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
