import { useDropzone } from 'react-dropzone'
import React, { useCallback } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

interface ImageUploadProps {
	uploadFunction: (data: any) => Promise<any> // Функция загрузки
	storeAction?: (response: any) => void // Опциональная функция для работы со стором
	requestData: (file: File) => any // Функция формирования данных запроса
	onUploadSuccess?: (response: any) => void // Callback на успешную загрузку
	onUploadError?: (error: any) => void // Callback на ошибку загрузки
	acceptTypes?: Record<string, string[]> // Форматы для загрузки
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	uploadFunction,
	storeAction,
	requestData,
	onUploadSuccess,
	onUploadError,
	acceptTypes = { 'image/*': [] },
}) => {
	const handleUpload = useCallback(
		async (file: File) => {
			const toastId = toast.loading('Загрузка изображения...')

			try {
				const data = requestData(file)
				const response = await uploadFunction(data)

				toast.success('Изображение загружено успешно!', {
					id: toastId,
					duration: 5000,
					richColors: true,
					action: (
						<div className='absolute top-[10px] right-[10px]'>
							<button
								className='hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out'
								onClick={() => toast.dismiss()}
							>
								✖
							</button>
						</div>
					),
				})

				if (storeAction) {
					storeAction(response)
				}

				if (onUploadSuccess) {
					onUploadSuccess(response)
				}
			} catch (e) {
				toast.error('Ошибка при загрузке изображения', {
					id: toastId,
					duration: 5000,
					richColors: true,
					action: (
						<div className='absolute top-[10px] right-[10px]'>
							<button
								className='hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out'
								onClick={() => toast.dismiss()}
							>
								✖
							</button>
						</div>
					),
				})

				if (onUploadError) {
					onUploadError(e)
				}

				console.error(e)
			}
		},
		[uploadFunction, storeAction, requestData, onUploadSuccess, onUploadError]
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

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'image/*': [],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				[],
			'application/msword': [],
		},
	})

	return (
		<div
			className={'w-full lg:w-[50%]'}
			style={{ margin: '0 auto', textAlign: 'center' }}
		>
			<h2 className='mb-2 mt-4 lg:mt-0 text-md text-primary font-semibold'>
				Загрузка файла
			</h2>
			<div
				{...getRootProps()}
				style={{
					border: '1px dashed rgba(9, 27, 93, 0.4)',
					borderRadius: '10px',
					padding: '10px',
					cursor: 'pointer',
				}}
			>
				<input {...getInputProps()} />
				<div>
					<p className='text-sm text-gray-400'>
						Перетащите файл сюда или кликните для выбора файла
					</p>
				</div>
			</div>
		</div>
	)
}

export default ImageUpload
