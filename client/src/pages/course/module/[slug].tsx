//@ts-ignore
//@ts-nocheck

import { useEffect, useState, useCallback } from 'react'

import Cookies from 'js-cookie'
import {
	ArrowLeft,
	BookOpen,
	Edit,
	HelpCircle,
	Info,
	Trash2,
	X,
} from 'lucide-react'
import { observer } from 'mobx-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AppSidebar } from '@/components/app-sidebar'
import AddAsk from '@/components/elements/AddAsk'
import AddLesson from '@/components/elements/AddLesson'
import AskCard from '@/components/elements/AskCard'
import LessonCard from '@/components/elements/LessonCard'
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
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { getAsks } from '@/lib/api/Asks'
import { checkType } from '@/lib/api/CheckType'
import {
	deleteModule,
	editTitleModule,
	getModuleLessons,
} from '@/lib/api/Modules'
import { CourseAddSchema } from '@/lib/schemas/CourseAddSchema'
import StoreCatalog from '@/lib/store/storeCatalog'
import StoreModule from '@/lib/store/storeModules'
import { Asks } from '@/lib/types/Asks'
import { Lessons } from '@/lib/types/Lessons'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import { zodResolver } from '@hookform/resolvers/zod'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ImportAsks from '@/components/elements/ImportAsks'

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
			const updatedModule = await editTitleModule(token, moduleId, title)

			// Обновляем данные модуля в store напрямую
			StoreModule.setModule({
				...moduleData,
				title: title,
			})

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

			// Обновляем каталог и модуль в фоне
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
	const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(true)

	useEffect(() => {
		const fetchLessons = async () => {
			setIsLessonsLoading(true)
			try {
				const response = await getModuleLessons(token, moduleId) // Ожидаем завершения запроса
				setLessons(response) // Устанавливаем данные
			} catch (e) {
				console.error('Ошибка при загрузке лекций:', e) // Логируем ошибку
			} finally {
				setIsLessonsLoading(false)
			}
		}

		fetchLessons() // Вызываем асинхронную функцию
	}, [token, moduleId]) // Данные изменятся только при изменении token или moduleId

	const [asks, setAsks] = useState<Asks[]>([])
	const [isAsksLoading, setIsAsksLoading] = useState<boolean>(true)

	const fetchAsks = useCallback(async () => {
		setIsAsksLoading(true)
		try {
			const response = await getAsks(token, moduleId) // Ожидаем завершения запроса
			setAsks(response) // Устанавливаем данные
		} catch (e) {
			console.error('Ошибка при загрузке вопросов:', e) // Логируем ошибку
		} finally {
			setIsAsksLoading(false)
		}
	}, [token, moduleId])

	useEffect(() => {
		fetchAsks()
	}, [fetchAsks])

	return (
		<>
			<Head>
				<title>ЭНЕРГИЯ - Модули - {moduleData?.title}</title>
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
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink href={`/course/${moduleData?.course_id}`}>
											Курс
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>Просмотр модуля</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>

					<div className='flex flex-1 flex-col gap-6 p-6 bg-gray-50'>
						{/* Заголовок модуля с действиями */}
						<Card className='border-none shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<div>
									<CardTitle className='text-2xl font-bold text-primary'>
										{moduleData?.title}
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
													onClick={() => handleDeleteModule()}
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
													<FormLabel>Название модуля</FormLabel>
													<div className='flex items-center gap-2'>
														<FormControl>
															<Input
																{...field}
																onChange={e => field.onChange(e.target.value)}
																type={'text'}
																placeholder={'Введите новое название модуля'}
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

						{/* Лекции */}
						<div className='pt-4 pb-0 bg-gray-50'>
							<Card className='border-none shadow-md'>
								<div className='sticky top-16 z-10 bg-white rounded-t-lg'>
									<CardHeader className='flex flex-row items-center justify-between pb-2'>
										<div>
											<CardTitle className='text-xl flex items-center gap-2'>
												<BookOpen className='h-5 w-5 text-blue-500' />
												Лекции
											</CardTitle>
											<CardDescription>
												Учебные материалы модуля
											</CardDescription>
										</div>
										<div>
											<AddLesson module_id={moduleId} />
										</div>
									</CardHeader>
								</div>

								<CardContent className='p-0'>
									{isLessonsLoading ? (
										<div className='flex flex-col items-center justify-center py-8 text-center'>
											<div className='h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-2'></div>
											<p className='text-gray-500 mb-4'>Загрузка лекций...</p>
										</div>
									) : lessons.length > 0 ? (
										<div className='grid gap-3 p-4 pt-2'>
											{lessons.map(lesson => (
												<LessonCard
													key={lesson.item_id}
													lesson={lesson}
													isLoading={loadingLessons}
													onNavigate={() => setLoadingLessons(true)}
												/>
											))}
										</div>
									) : (
										<div className='flex flex-col items-center justify-center py-8 text-center'>
											<Info className='h-12 w-12 text-gray-300 mb-2' />
											<p className='text-gray-500 mb-4'>
												Лекции пока не добавлены
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Вопросы */}
						<div className='pt-4 pb-0 bg-gray-50'>
							<Card className='border-none shadow-md'>
								<div className='sticky top-16 z-10 bg-white rounded-t-lg'>
									<CardHeader className='flex flex-row items-center justify-between pb-2'>
										<div>
											<CardTitle className='text-xl flex items-center gap-2'>
												<HelpCircle className='h-5 w-5 text-amber-500' />
												Вопросы
											</CardTitle>
											<CardDescription>
												Контрольные вопросы для проверки знаний
											</CardDescription>
										</div>
										<div className='flex items-center gap-2'>
											<AddAsk module_id={moduleId} />
											<ImportAsks module_id={moduleId} onSuccess={fetchAsks} />
										</div>
									</CardHeader>
								</div>

								<CardContent className='p-0'>
									{isAsksLoading ? (
										<div className='flex flex-col items-center justify-center py-8 text-center'>
											<div className='h-12 w-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-2'></div>
											<p className='text-gray-500 mb-4'>Загрузка вопросов...</p>
										</div>
									) : asks.length > 0 ? (
										<div className='grid gap-3 p-4 pt-2'>
											{asks.map(ask => (
												<AskCard
													key={ask.item_id}
													ask={ask}
													isLoading={loadingAsks}
													onNavigate={() => setLoadingAsks(true)}
												/>
											))}
										</div>
									) : (
										<div className='flex flex-col items-center justify-center py-8 text-center'>
											<Info className='h-12 w-12 text-gray-300 mb-2' />
											<p className='text-gray-500 mb-4'>
												Вопросы пока не добавлены
											</p>
										</div>
									)}
								</CardContent>
							</Card>
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
