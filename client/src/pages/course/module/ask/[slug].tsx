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
	Edit,
	MessageCircle,
	PanelLeft,
	Trash2,
	X,
} from 'lucide-react'

import Head from 'next/head'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/router'
import { Asks } from '@/lib/types/Asks'
import { Input } from '@/components/ui/input'
import { Lessons } from '@/lib/types/Lessons'
import { Courses } from '@/lib/types/Courses'
import { Modules } from '@/lib/types/Modules'
import StoreAsks from '@/lib/store/storeAsks'
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
import { deleteAsk, editTitleAsk } from '@/lib/api/Asks'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import ImageUpload from '@/components/elements/ImageUpload'
import AddAskAnswer from '@/components/elements/AddAskAnswer'
import { CourseAddSchema } from '@/lib/schemas/CourseAddSchema'
import { deleteLesson, editTitleLesson } from '@/lib/api/Lessons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const Ask = observer(({ ask }) => {
	const token = Cookies.get('users_access_token')
	const askId = ask.item_id
	const router = useRouter()

	useEffect(() => {
		// Инициализируем store данными из SSR
		if (ask) {
			StoreAsks.initializeAsk(ask)
		}
	}, [ask])

	useEffect(() => {
		if (askId) {
			StoreAsks.getAsk(askId)
		}
	}, [askId])

	const askData = StoreAsks.ask

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

		const toastId = toast.loading('Изменение названия вопроса...')

		try {
			const token = Cookies.get('users_access_token')
			// Передаем текущий объект askData, чтобы сохранить ответы
			const updatedAsk = await editTitleAsk(
				token,
				askData?.module_id,
				askId,
				title,
				askData // Передаем весь объект askData, чтобы сохранить ответы и другие данные
			)

			// Обновляем данные вопроса в store напрямую
			StoreAsks.setAsk({
				...askData,
				title: title,
			})

			toast.success('Название вопроса изменено!', {
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

			// Обновляем каталог и вопрос в фоне
			StoreCatalog.loading().then()
			if (askId) {
				await StoreAsks.getAsk(askId).then()
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

	const handleDeleteAsk = async () => {
		const toastId = toast.loading('Удаление вопроса...')

		try {
			const response = await deleteAsk(token, askData?.module_id, askId)

			toast.success('Вопрос удален!', {
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

	return (
		<>
			<Head>
				<title>ЭНЕРГИЯ - Вопросы - {askData?.title}</title>
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
										<BreadcrumbLink href={`/course/${askData?.course_id}`}>
											Курс
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink
											href={`/course/module/${askData?.module_id}`}
										>
											Модуль
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>{askData?.title}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
					</header>

					<div className='flex flex-1 flex-col gap-6 p-6 bg-gray-50'>
						{/* Заголовок вопроса с действиями */}
						<div className='sticky top-16 z-20'>
							<div className='rounded-lg bg-white shadow-md p-4 flex flex-row items-center justify-between'>
								<h2 className='text-2xl font-bold text-primary'>
									{askData?.title}
								</h2>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant='outline'
											size='icon'
											className='text-red-500 border-red-200 hover:bg-red-50 mr-1'
										>
											<div className='flex-shrink-0 flex items-center justify-center w-8 h-8'>
												<Trash2 className='h-4 w-4' />
											</div>
										</Button>
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
												onClick={() => handleDeleteAsk()}
												className={'bg-red-500 hover:bg-red-400'}
											>
												Удалить
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>

						{/* Содержимое вопроса */}
						<div className='grid grid-cols-1 gap-6'>
							{/* Форма редактирования названия */}
							<div className='rounded-lg bg-white shadow-md p-5'>
								<h3 className='text-lg font-medium mb-4 flex items-center gap-2'>
									<Edit className='h-4 w-4 text-blue-500' />
									Редактирование вопроса
								</h3>
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
													<FormLabel>Название вопроса</FormLabel>
													<div className='flex items-center gap-2'>
														<FormControl>
															<Input
																{...field}
																onChange={e => field.onChange(e.target.value)}
																type={'text'}
																placeholder={'Введите новое название вопроса'}
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
							</div>

							{/* Ответы на вопрос */}
							<div className='rounded-lg bg-white shadow-md overflow-hidden'>
								<div className='p-5 border-b'>
									<h3 className='text-lg font-medium flex items-center gap-2'>
										<MessageCircle className='h-4 w-4 text-amber-500' />
										Ответы на вопрос
									</h3>
								</div>
								<div className='p-5'>
									<AddAskAnswer
										title={askData?.title}
										module_id={askData?.module_id}
										ask_id={askId}
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

export default Ask

export async function getServerSideProps({ params, req, res }) {
	const ask = await checkType('ask', params.slug, { req, res })

	if (!ask) {
		return { notFound: true }
	}

	return { props: { ask } }
}
