//@ts-nocheck

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import API from '../../../axiosConfig'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { httpErrorsSplit } from '@/utils/httpErrorsSplit'
import { config, MdEditor } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import RU from '@vavt/cm-extension/dist/locale/ru'
import { editContentLesson } from '@/lib/api/Lessons'

// Конфигурация редактора
config({
	editorConfig: {
		languageUserDefined: {
			ru: RU,
		},
	},
})

interface EditorProps {
	lesson_id: string
	title: string
	token: string // Для авторизации запросов
	initialContent: string // Пропс для начального содержимого
}

export default function Editor({
	lesson_id,
	title,
	token,
	initialContent,
}: EditorProps) {
	const onUploadImg = async (files: any, callback: any) => {
		const res = await Promise.all(
			files.map((file: any) => {
				return new Promise((rev, rej) => {
					const form = new FormData()
					form.append('file_bytes', file) // Используем 'file_bytes' как ожидаемое поле

					// Отправка изображения на сервер
					API.post(`/lessons/${lesson_id}/image/`, form, {
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: `Bearer ${token}`,
						},
						params: {
							lesson_id: lesson_id,
							file_name: file.name, // Используем имя файла
						},
					})
						.then(response => rev(response)) // Возвращаем успешный ответ
						.catch(error => rej(error)) // Обработка ошибки
				})
			})
		)

		// Получаем URL изображения и передаем его в callback
		callback(res.map(item => item.data.url))
	}

	const [content, setContent] = useState<string>(initialContent || '')

	useEffect(() => {
		setContent(initialContent || '')
	}, [initialContent])

	const saveContent = async () => {
		const toastId = toast.loading('Загрузка контента лекции...')

		try {
			// Сохраняем контент лекции
			await editContentLesson(token, lesson_id, title, {
				text: content,
			})

			// Уведомление о успешном сохранении
			toast.success('Текст лекции обновлен!', {
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
		} catch (e) {
			// Обработка ошибки сохранения
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

	// Функция для вставки горизонтальной линии в редактор
	const insertHr = () => {
		setContent(prevContent => `${prevContent}\n---\n`) // Вставляем "---" для горизонтальной линии
	}

	const toolbarsExclude = [
		'underline',
		'sup',
		'sub',
		'task',
		'codeRow',
		'code',
		'mermaid',
		'katex',
		'save',
		'catalog',
		'github',
	]

	// @ts-ignore
	return (
		<div>
			<p className='text-lg font-semibold text-primary mb-2'>Контент лекции</p>

			<div className='mb-4'>
				<Button onClick={insertHr} className='mr-2'>
					Добавить разделитель страницы
				</Button>
			</div>

			<MdEditor
				language='ru'
				value={content}
				onChange={setContent}
				onUploadImg={onUploadImg} // Подключаем обработчик загрузки изображений
				height={400} // Устанавливаем высоту редактора
				toolbarsExclude={toolbarsExclude} // Применяем исключение кнопок
			/>

			<Button className='w-full mt-4' onClick={saveContent}>
				Сохранить
			</Button>
		</div>
	)
}
