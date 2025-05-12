//@ts-ignore
//@ts-nocheck

import React, { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogPortal,
	DialogOverlay,
	DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ImagePreviewProps {
	src: string
	alt?: string
	className?: string
	containerClassName?: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
	src,
	alt = '',
	className = '',
	containerClassName = '',
}) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<div
					className={cn(
						'relative group cursor-pointer transition-all duration-300',
						containerClassName
					)}
				>
					<img
						src={src}
						alt={alt}
						className={cn(
							'rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-300',
							className
						)}
					/>
					<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center rounded-lg transition-all duration-300'>
						<span className='text-white opacity-0 group-hover:opacity-100 font-medium transition-all duration-300 bg-primary/70 rounded-md px-2 py-1'>
							Увеличить
						</span>
					</div>
				</div>
			</DialogTrigger>
			<DialogPortal>
				<DialogOverlay className='bg-gray-500/50' />
				<DialogContent className='max-w-4xl p-0 bg-transparent border-none'>
					<img src={src} alt={alt} className='w-full h-auto rounded-lg' />
					<DialogClose className='absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full transition-all duration-300'>
						<X size={20} />
						<span className='sr-only'>Закрыть</span>
					</DialogClose>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	)
}

export default ImagePreview
