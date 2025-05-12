import React from 'react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Folder } from 'lucide-react'
import { Catalog } from '@/lib/types/Catalogs'
import Link from 'next/link'

const CatalogElement = ({ ...props }: Catalog) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				key={props.item_id}
				className={
					'w-full flex flex-row items-center gap-2 text-left p-2 rounded-sm transition ease-in-out duration-300 hover:bg-gray-200'
				}
			>
				<div className={'flex shrink-0'}>
					<Folder size={16} className='text-primary' />
				</div>
				<p>{props.title}</p>
			</DropdownMenuTrigger>
			<DropdownMenuContent className={'w-full'}>
				<DropdownMenuLabel>Взаимодействие</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<Link href={`/course/${props.item_id}`} className={'cursor-pointer'}>
					<DropdownMenuItem>Открыть</DropdownMenuItem>
				</Link>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default CatalogElement
