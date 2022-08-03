import {
    useSetMobileDevice,
    appTitle,
    CoreProvider,
    isBrowser,
    getConfigs,
} from '@openware/opendax-web-sdk'
import '@openware/opendax-web-sdk/index.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect, useMemo, useCallback } from 'react'
import '../styles/globals.css'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

const CustomizationWidget = dynamic(() =>
    import('@openware/opendax-web-sdk').then((mod: any) => mod.CustomizationWidget), {
    ssr:false
})

const Alerts = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.Alerts), {
    ssr: false,
})

export default function App({ Component, pageProps }: AppProps): JSX.Element {
    const isMobile = useSetMobileDevice();
    const router = useRouter();

    const gitCommitSha = useMemo(() => {
        return (
            process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || // comes from the Vercel deployment
            process.env.NEXT_PUBLIC_GIT_COMMIT_SHA // comes from the Drone config through the Docker build
        )
    }, [
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        process.env.NEXT_PUBLIC_GIT_COMMIT_SHA,
    ])

    const handleUploadImage = useCallback(async (name: string, file: File) => {
        const data = new FormData()
        data.append(name, file)

        const res = await fetch('/api/storage/upload', {
            method: 'POST',
            body: data,
        })

        return res
    }, [])

    const mainContent = useMemo(() => {
        return (
            <>
                <Component {...pageProps} />
                {!isMobile && router.pathname !== '/setup' && (
                    // @ts-ignore
                    <CustomizationWidget onUploadImage={handleUploadImage} />
                )}
            </>
        )
    }, [isMobile, pageProps])
    
    useEffect(() => {
        if (isBrowser()) {
            const hashCommit = localStorage.getItem('hashCommit')
            if (hashCommit === 'undefined') {
                localStorage.setItem('hashCommit', JSON.stringify(gitCommitSha))
            } else if (hashCommit !== JSON.stringify(gitCommitSha)) {
                localStorage.clear()
                localStorage.setItem('hashCommit', JSON.stringify(gitCommitSha))
            }
        }
    }, [isBrowser, gitCommitSha])

    const favicon = useMemo(() => {
        const appLogos = getConfigs().appLogos

        if (appLogos) {
            const newLogos = JSON.parse(appLogos);

            return newLogos?.favicon || '/favicon.svg';
        }

        return '/favicon.svg';
    }, [getConfigs()])

    return (
        <>
            <Head>
                <link rel="icon" type="image/svg+xml" href={favicon} />
                <meta name="git-commit" content={gitCommitSha} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>{appTitle()}</title>
            </Head>
            <CoreProvider>
                <div className="bg-main-background-color">
                    <Alerts />
                    {mainContent}
                </div>
            </CoreProvider>
        </>
    )
}
