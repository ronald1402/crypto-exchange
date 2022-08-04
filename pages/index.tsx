import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, useCallback, useEffect } from 'react'
import { useIntl } from 'react-intl'

const Home: FC<{}> = (): JSX.Element => {
    const intl = useIntl()
    const router = useRouter()

    const translate = useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    useEffect(() => {
        router.push('/trading')
    }, [])

    return (
        <>
            <Head>
                <title>My page title</title>
            </Head>
        </>
    )
}

export default Home
