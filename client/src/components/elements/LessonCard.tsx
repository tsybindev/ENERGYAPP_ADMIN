import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookOpen, ChevronRight } from 'lucide-react'
import { Lessons } from '@/lib/types/Lessons'

interface LessonCardProps {
	lesson: Lessons
	isLoading: boolean
	onNavigate: () => void
}

const LessonCard: React.FC<LessonCardProps> = ({
	lesson,
	isLoading,
	onNavigate,
}) => {
	return (
		<Link
			href={isLoading ? '#' : `/course/module/lesson/${lesson.item_id}`}
			onClick={e => {
				if (isLoading) {
					e.preventDefault()
					return
				}
				onNavigate()
			}}
			className={cn(
				'group flex items-center justify-between p-3 rounded-lg transition-all duration-300',
				'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow',
				isLoading && 'opacity-50 cursor-not-allowed'
			)}
		>
			<div className='flex items-center gap-3'>
				<div className='flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
					<BookOpen className='h-5 w-5 text-blue-500' />
				</div>
				<div>
					<h3 className='font-medium text-gray-900'>{lesson.title}</h3>
				</div>
			</div>
			<div className='flex-shrink-0 flex items-center justify-center w-8 h-8'>
				<ChevronRight className='h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300' />
			</div>
		</Link>
	)
}

export default LessonCard
