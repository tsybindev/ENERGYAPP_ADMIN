import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { parseCookies } from 'nookies'
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import StoreCatalog from '@/lib/store/storeCatalog'
import StoreUser from '@/lib/store/storeUser'

let isLoad = false

const inter = Inter({
	subsets: ['latin'],
})

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter()

	useEffect(() => {
		const checkAuth = () => {
			const cookies = parseCookies()
			const authToken = cookies.users_access_token

			const publicPage = ['/auth']
			const isPublicPage = publicPage.includes(router.pathname)

			if (!authToken && !isPublicPage) {
				router.push('/auth').then()
				return
			}

			if (!isLoad && authToken) {
				StoreCatalog.loading().then()
				StoreUser.loading().then()
				isLoad = true
			}
		}

		checkAuth()
	}, [router, router.pathname])

	return (
		<main className={`${inter.className}`}>
			<Toaster />
			<Component {...pageProps} />
		</main>
	)
}
