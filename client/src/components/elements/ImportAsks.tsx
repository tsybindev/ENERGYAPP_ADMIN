import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Import, X } from 'lucide-react'
import Cookies from 'js-cookie'
import { createAsks } from '@/lib/api/Asks'
import { AskImportSchema } from '@/lib/schemas/AskImportSchema'
import StoreCatalog from '@/lib/store/storeCatalog'

type ComponentProps = {
	module_id: string
	onSuccess?: () => void
}

const ImportAsks = ({ ...props }: ComponentProps) => {
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
		const toastId = toast.loading('Импорт вопросов из файла...')

		try {
			const reader = new FileReader()
			reader.onload = async e => {
				let validatedData
				// Сначала только валидация
				try {
					const jsonContent = JSON.parse(e.target?.result as string)
					validatedData = AskImportSchema.parse(jsonContent)
				} catch (parseError) {
					toast.error(
						`Ошибка при валидации JSON файла: ${
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
					await createAsks(token, props.module_id, validatedData)
					toast.success('Вопросы успешно импортированы!', {
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
					if (props.onSuccess) props.onSuccess()
				} catch (serverError) {
					toast.error(
						`Ошибка сервера: ${
							serverError instanceof Error
								? serverError.message
								: 'Неизвестная ошибка'
						}`,
						{ id: toastId, duration: 5000, richColors: true }
					)
				} finally {
					setIsLoading(false)
					if (fileInputRef.current) {
						fileInputRef.current.value = ''
					}
				}
			}
			reader.readAsText(file)
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
				accept='.json'
				onChange={handleFileImport}
				className='hidden'
				disabled={isLoading}
			/>
			<Button className='w-full' 
				disabled={isLoading}
				onClick={()=> fileInputRef.current?.click()}
			>
				<Import className='h-4 w-4' />
				Импорт из файла
			</Button>
		</div>
	)
}

export default ImportAsks
