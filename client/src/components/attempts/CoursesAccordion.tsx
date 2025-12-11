import React, { useState } from 'react'
import { Course } from '@/types/attempts'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BookCheck, BookX, ShieldMinus } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
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

interface CoursesAccordionProps {
	courses: Course[]
	checkedAttempts: Set<string>
	onToggle: (id: string) => void
	onDeleteAttempt: (id: string) => void
	isLoading?: boolean
}

export const CoursesAccordion: React.FC<CoursesAccordionProps> = ({
	courses,
	checkedAttempts,
	onToggle,
	onDeleteAttempt,
	isLoading = false,
}) => {
	const [openCourses, setOpenCourses] = useState<Set<string>>(new Set())

	const toggleCourse = (courseId: string) => {
		setOpenCourses(prev => {
			const next = new Set(prev)
			if (next.has(courseId)) {
				next.delete(courseId)
			} else {
				next.add(courseId)
			}
			return next
		})
	}

	const toggleAllCourseAttempts = (course: Course) => {
		const allAttemptIds = course.attempts.map(attempt => attempt.id)
		const allChecked = allAttemptIds.every(id => checkedAttempts.has(id))

		allAttemptIds.forEach(id => {
			if (allChecked) {
				onToggle(id)
			} else if (!checkedAttempts.has(id)) {
				onToggle(id)
			}
		})
	}

	const isCourseChecked = (course: Course) => {
		return (
			course.attempts.length > 0 &&
			course.attempts.every(attempt => checkedAttempts.has(attempt.id))
		)
	}

	const isCourseSemiChecked = (course: Course) => {
		const checkedCount = course.attempts.filter(attempt =>
			checkedAttempts.has(attempt.id)
		).length
		return checkedCount > 0 && checkedCount < course.attempts.length
	}

	if (isLoading) {
		return (
			<div className='text-center py-8'>
				<div className='flex justify-center mb-2'>
					<div className='h-12 w-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin'></div>
				</div>
				<p className='text-gray-500'>Загрузка данных...</p>
			</div>
		)
	}

	if (!courses.length) {
		return (
			<div className='text-center text-gray-500 py-8'>Курсы не найдены</div>
		)
	}

	return (
		<TooltipProvider>
			<div className='space-y-2'>
				{courses.map(course => (
					<div key={course.id} className='rounded-lg bg-gray-50 p-3'>
						<div className='flex items-center gap-2'>
							{course.attempts.length > 0 && (
								<input
									type='checkbox'
									checked={isCourseChecked(course)}
									ref={el => {
										if (el) {
											el.indeterminate = isCourseSemiChecked(course)
										}
									}}
									onChange={() => toggleAllCourseAttempts(course)}
									className='h-4 w-4 accent-primary cursor-pointer'
								/>
							)}
							<button
								onClick={() => toggleCourse(course.id)}
								className='flex items-center gap-2 text-sm font-medium hover:text-primary'
							>
								{openCourses.has(course.id) ? '▼' : '▶'} {course.name}
							</button>
						</div>
						{openCourses.has(course.id) && (
							<div className='mt-2 ml-6 space-y-2'>
								{course.attempts.length > 0 ? (
									course.attempts.map(attempt => (
										<div key={attempt.id} className='flex items-center gap-2'>
											<input
												type='checkbox'
												checked={checkedAttempts.has(attempt.id)}
												onChange={() => onToggle(attempt.id)}
												className='h-4 w-4 accent-primary cursor-pointer'
											/>
											<div className='flex items-center gap-2'>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className='flex items-center gap-1 text-sm'>
															{attempt.is_completed ? (
																<BookCheck className='w-4 h-4 text-green-600' />
															) : (
																<BookX className='w-4 h-4 text-red-600' />
															)}
															Попытка от{' '}
															{format(
																new Date(attempt.date),
																'dd MMMM yyyy HH:mm',
																{
																	locale: ru,
																}
															)}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														<p>
															{attempt.is_completed
																? 'Экзамен сдан'
																: 'Экзамен не сдан'}
														</p>
													</TooltipContent>
												</Tooltip>
												<AlertDialog>
													<Tooltip>
														<TooltipTrigger asChild>
															<AlertDialogTrigger asChild>
																{attempt.is_completed && (
																	<ShieldMinus className='w-4 h-4 text-red-600 cursor-pointer' />
																)}
															</AlertDialogTrigger>
														</TooltipTrigger>
														<TooltipContent>
															<p>Аннулировать экзамен</p>
														</TooltipContent>
													</Tooltip>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Подтверждение действия
															</AlertDialogTitle>
															<AlertDialogDescription>
																<p>
																	Вы точно хотите аннулировать данный экзамен?
																</p>
																<p>Действие невозможно отменить.</p>
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Нет</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => onDeleteAttempt(attempt.id)}
															>
																Да
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
									))
								) : (
									<div className='text-gray-500 text-sm text-center'>
										Нет попыток для данного курса
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</TooltipProvider>
	)
}
