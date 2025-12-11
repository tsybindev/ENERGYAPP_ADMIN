'use client'

import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import storeSettings from '@/lib/store/storeSettings'
import { Skeleton } from '../ui/skeleton'
import { Percent } from 'lucide-react'

const PassingPercentSettings = observer(() => {
	const [isSheetOpen, setIsSheetOpen] = useState(false)

	const handleSuccess = () => {
		setIsSheetOpen(false)
	}

	return (
		<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
			<SheetTrigger asChild>
				<button className='w-full mb-2 flex items-center text-sm justify-center border border-border hover:bg-gray-200 rounded-md py-1.5'>
					<Percent className='mr-2 h-4 w-4' />
					Проходной процент
				</button>
			</SheetTrigger>
			<SheetContent>
				<PassingPercentForm onSuccess={handleSuccess} />
			</SheetContent>
		</Sheet>
	)
})

const PassingPercentForm = observer(
	({ onSuccess }: { onSuccess: () => void }) => {
		const { percent, isLoading, fetchPercent, setPercent } = storeSettings
		const [newPercent, setNewPercent] = useState<string>('')

		useEffect(() => {
			if (storeSettings.percent === null) {
				fetchPercent()
			}
		}, [fetchPercent])

		useEffect(() => {
			if (percent !== null) {
				setNewPercent(String(percent))
			}
		}, [percent])

		const handleApply = async () => {
			const value = parseInt(newPercent, 10)
			if (!isNaN(value) && value >= 0 && value <= 100) {
				try {
					await setPercent(value)
					onSuccess()
				} catch (error) {}
			}
		}

		const isButtonDisabled =
			isLoading ||
			newPercent === '' ||
			parseInt(newPercent, 10) === percent ||
			parseInt(newPercent, 10) < 0 ||
			parseInt(newPercent, 10) > 100

		return (
			<div className='flex flex-col gap-y-4'>
				<h2 className='text-xl font-semibold'>Настройки</h2>
				<div className='flex flex-col gap-y-2'>
					<p>Изменение проходного процента по экзамену.</p>
					{isLoading && percent === null ? (
						<Skeleton className='h-6 w-1/2' />
					) : (
						<p>
							Текущий проходной процент: <strong>{percent ?? '...'}%</strong>
						</p>
					)}
				</div>
				<div className='flex flex-col gap-y-2'>
					<label htmlFor='newPercent'>
						Новое значение<small> (от 0 до 100)</small>
					</label>
					<Input
						id='newPercent'
						type='number'
						min='0'
						max='100'
						value={newPercent}
						onChange={e => setNewPercent(e.target.value)}
						placeholder='От 0 до 100'
						disabled={isLoading}
					/>
				</div>
				<Button onClick={handleApply} disabled={isButtonDisabled}>
					{isLoading ? 'Применение...' : 'Применить изменения'}
				</Button>
			</div>
		)
	}
)

export default PassingPercentSettings
