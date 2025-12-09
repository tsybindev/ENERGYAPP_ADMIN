import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Import, X } from 'lucide-react'
import Cookies from 'js-cookie'
import { createUsers } from '@/lib/api/Users'
import { UserImportSchema } from '@/lib/schemas/UserImportSchema'
import Papa from 'papaparse'

type ComponentProps = {
	onSuccess?: () => void
}

const ImportUsers = ({ ...props }: ComponentProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileImport = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file) {
			return
		}

		setIsLoading(true)
		const toastId = toast.loading('Импорт пользователей из файла...')

		try {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				complete: async results => {
					let validatedData
					try {
						validatedData = UserImportSchema.parse(results.data)
					} catch (parseError) {
						toast.error(
							`Ошибка при валидации CSV файла: ${
								parseError instanceof Error
									? parseError.message
									: 'Ошибка формата'
							}`,
							{ id: toastId, duration: 5000, richColors: true }
						)
						setIsLoading(false)
						if (fileInputRef.current) {
							fileInputRef.current.value = ''
						}
						return
					}

					// Если валидация прошла — отправляем на сервер
					try {
						const token = Cookies.get('users_access_token')
						if (!token) {
							throw new Error('Токен не найден')
						}
						console.log(validatedData)
						await createUsers(token, validatedData)
						toast.success('Пользователи успешно импортированы!', {
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
						if (props.onSuccess) props.onSuccess()
					} catch (serverError: any) {
						let errorMessage = 'Неизвестная ошибка'
						if (serverError.response && serverError.response.status === 409) {
							const errorData = serverError.response.data
							if (errorData.errors && errorData.errors[0].code === 25) {
								errorMessage = 'Данный пользователь уже зарегистрирован'
							} else {
								errorMessage = `Ошибка сервера: ${serverError.message}`
							}
						} else if (serverError instanceof Error) {
							errorMessage = `Ошибка сервера: ${serverError.message}`
						}
						toast.error(errorMessage, {
							id: toastId,
							duration: 5000,
							richColors: true,
						})
					} finally {
						setIsLoading(false)
						if (fileInputRef.current) {
							fileInputRef.current.value = ''
						}
					}
				},
				error: error => {
					toast.error(`Ошибка при парсинге CSV: ${error.message}`, {
						id: toastId,
						duration: 5000,
						richColors: true,
					})
					setIsLoading(false)
					if (fileInputRef.current) {
						fileInputRef.current.value = ''
					}
				},
			})
		} catch (error) {
			toast.error('Ошибка при импорте файла.', {
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
			setIsLoading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	return (
		<div className='relative'>
			<Input
				ref={fileInputRef}
				type='file'
				accept='.csv'
				onChange={handleFileImport}
				className='absolute inset-0 opacity-0 cursor-pointer'
				disabled={isLoading}
			/>
			<Button className='w-full' disabled={isLoading}>
				<Import className='h-4 w-4' />
				Импорт слушателей
			</Button>
		</div>
	)
}

export default ImportUsers
