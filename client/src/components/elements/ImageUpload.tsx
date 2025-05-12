import { useDropzone } from 'react-dropzone'
import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { Upload, FileUp, X } from 'lucide-react'

interface ImageUploadProps {
	uploadFunction: (data: any) => Promise<any> // Функция загрузки
	storeAction?: (response: any) => void // Опциональная функция для работы со стором
	requestData: (file: File) => any // Функция формирования данных запроса
	onUploadSuccess?: (response: any) => void // Callback на успешную загрузку
	onUploadError?: (error: any) => void // Callback на ошибку загрузки
	acceptTypes?: Record<string, string[]> // Форматы для загрузки
	title?: string // Заголовок компонента
	isDocument?: boolean // Флаг для документов
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	uploadFunction,
	storeAction,
	requestData,
	onUploadSuccess,
	onUploadError,
	acceptTypes,
	title = 'Загрузка файла',
	isDocument = false,
}) => {
	const [isUploading, setIsUploading] = useState(false)

	const handleUpload = useCallback(
		async (file: File) => {
			const toastId = toast.loading(
				isDocument ? 'Загрузка документа...' : 'Загрузка изображения...'
			)
			setIsUploading(true)

			try {
				const data = requestData(file)
				const response = await uploadFunction(data)

				toast.success(
					isDocument
						? 'Документ загружен успешно!'
						: 'Изображение загружено успешно!',
					{
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
					}
				)

				if (storeAction) {
					storeAction(response)
				}

				if (onUploadSuccess) {
					onUploadSuccess(response)
				}
			} catch (e) {
				toast.error(
					isDocument
						? 'Ошибка при загрузке документа'
						: 'Ошибка при загрузке изображения',
					{
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
					}
				)

				if (onUploadError) {
					onUploadError(e)
				}

				console.error(e)
			} finally {
				setIsUploading(false)
			}
		},
		[
			uploadFunction,
			storeAction,
			requestData,
			onUploadSuccess,
			onUploadError,
			isDocument,
		]
	)

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				const file = acceptedFiles[0]
				handleUpload(file)
			}
		},
		[handleUpload]
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: acceptTypes || {
			'image/*': [],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				[],
			'application/msword': [],
		},
		disabled: isUploading,
	})

	return (
		<div className='w-full'>
			<h2 className='mb-2 text-md text-primary font-semibold'>{title}</h2>
			<div
				{...getRootProps()}
				className={`
					w-full border-2 border-dashed rounded-lg p-4 transition-all duration-300 ease-in-out
					${
						isDragActive
							? 'border-primary bg-primary/5'
							: 'border-primary/20 hover:border-primary/40'
					}
					${isUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
				`}
			>
				<input {...getInputProps()} />
				<div className='flex flex-col items-center justify-center gap-2 py-4'>
					{isDocument ? (
						<FileUp className='h-10 w-10 text-primary/60' />
					) : (
						<Upload className='h-10 w-10 text-primary/60' />
					)}
					<p className='text-sm font-medium text-primary/80'>
						{isDragActive
							? 'Перетащите файл сюда...'
							: isUploading
							? 'Загрузка...'
							: 'Перетащите файл сюда или кликните для выбора'}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						{isDocument
							? 'Поддерживаемые форматы: DOC, DOCX'
							: 'Поддерживаемые форматы: JPG, PNG, GIF'}
					</p>
				</div>
			</div>
		</div>
	)
}

export default ImageUpload
