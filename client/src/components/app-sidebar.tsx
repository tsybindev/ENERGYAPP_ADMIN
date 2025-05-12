//@ts-nocheck
//@ts-ignore

import * as React from 'react'
import {
	BookCheck,
	ChevronRight,
	File,
	FileQuestion,
	Folder,
	Package,
	StickyNote,
	Camera,
} from 'lucide-react'
import Image from 'next/image'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarRail,
} from '@/components/ui/sidebar'
import AddCourse from '@/components/elements/AddCourse'
import { Separator } from '@/components/ui/separator'
import {
	Catalog,
	CatalogModule,
	CatalogModuleAsk,
	CatalogModuleAskAnswer,
	CatalogModuleLesson,
} from '@/lib/types/Catalogs'
import StoreCatalog from '@/lib/store/storeCatalog'
import { observer } from 'mobx-react'
import CatalogElement from '@/components/elements/CatalogElement'
import Link from 'next/link'
import Profile from '@/components/elements/Profile'

export const AppSidebar = observer(
	({ ...props }: React.ComponentProps<typeof Sidebar>) => {
		const data = StoreCatalog.catalog

		return (
			<Sidebar {...props}>
				<SidebarHeader>
					<SidebarGroup>
						<div className={'flex flex-row gap-4 my-2 items-center'}>
							<Image
								src={'/static/logo.svg'}
								alt={'ЭНЕРГИЯ'}
								width={48}
								height={48}
								quality={100}
							/>
							<div className={'flex flex-col gap-0 justify-center'}>
								<p className={'text-xl text-primary font-bold leading-none'}>
									ЧОУ ДПО
								</p>
								<p className={'text-md text-primary leading-none'}>
									&ldquo;УЦ &ldquo;ЭНЕРГИЯ&rdquo;
								</p>
							</div>
						</div>
					</SidebarGroup>

					<Separator />

					<SidebarGroup className={'mt-1'}>
						<AddCourse />
					</SidebarGroup>

					<SidebarGroupLabel className={'mt-2'}>
						Список курсов
					</SidebarGroupLabel>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{data?.map(catalog => (
									<CatalogElement
										key={catalog.item_id}
										title={catalog.title}
										item_id={catalog.item_id}
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<Separator />
					<SidebarGroup>
						<Profile />
					</SidebarGroup>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>
		)
	}
)

function Tree({
	item,
}: {
	item:
		| Catalog
		| CatalogModule
		| CatalogModuleLesson
		| CatalogModuleAsk
		| CatalogModuleAskAnswer
}) {
	const isCatalog = (i: any): i is Catalog => 'modules' in i
	const isModule = (i: any): i is CatalogModule => 'lessons' in i || 'asks' in i
	const isLesson = (i: any): i is CatalogModuleLesson =>
		'item_id' in i && !('answers' in i)
	const isAsk = (i: any): i is CatalogModuleAsk => 'answers' in i

	const getIcon = (isChild: boolean = false) => {
		if (isCatalog(item))
			return (
				<div className={'flex shrink-0'}>
					<Folder className='text-blue-500' />
				</div>
			)
		if (isModule(item)) return <Package className='text-green-500' />
		if (isLesson(item)) {
			return <StickyNote className='text-orange-500' />
		}
		if (isAsk(item)) {
			return isChild ? (
				<FileQuestion className='text-purple-500' />
			) : (
				<BookCheck className='text-yellow-500' />
			)
		}
		return <File className='text-gray-500' />
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
				defaultOpen={false}
			>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton>
						<ChevronRight className='transition-transform' />
						{getIcon()}
						{item.title}
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub className={'w-full'}>
						{isCatalog(item) &&
							item.modules.map(module => (
								<Tree key={module.item_id} item={module} />
							))}
						{isModule(item) && (
							<>
								{item.lessons.map(lesson => (
									<SidebarMenuButton key={lesson.item_id} className='pl-6'>
										<StickyNote />
										{lesson.title}
									</SidebarMenuButton>
								))}
								{item.asks.length > 0 && (
									<Collapsible
										className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
										defaultOpen={false}
									>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton className='pl-6'>
												<ChevronRight className='transition-transform' />
												<BookCheck className='text-yellow-500' />
												Тестирование
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent className={'pl-10'}>
											{item.asks.map(ask => (
												<Tree key={ask.item_id} item={ask} />
											))}
										</CollapsibleContent>
									</Collapsible>
								)}
							</>
						)}
						{isAsk(item) &&
							item.answers.map(answer => (
								<SidebarMenuButton key={answer.item_id} className='pl-6'>
									{getIcon(true)}
									{answer.title}
								</SidebarMenuButton>
							))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	)
}
