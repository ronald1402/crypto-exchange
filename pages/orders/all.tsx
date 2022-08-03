import {
    useSetMobileDevice,
    withAuth,
    appTitle,
    NavTabs,
} from '@openware/opendax-web-sdk'
import classnames from 'classnames'
import { Layout } from '../../components'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import router from 'next/router'
import React from 'react'
import { useIntl } from 'react-intl'

const OrdersAll = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.OrdersAll), {
    ssr: false,
})

const OrdersAllHistory: React.FC = () => {
    const intl = useIntl()
    const isMobile = useSetMobileDevice()

    const wrapperClassName = classnames('flex flex-col h-full w-full', {
        'flex flex-col h-screen w-full p-6': !isMobile,
    })

    const translate = React.useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    const navigationTabsArray = React.useMemo(() => {
        return [
            {
                name: 'all',
                label: translate('page.body.openOrders.tab.all'),
                isCurrentTab: true,
            },
            {
                name: 'open',
                label: translate('page.body.openOrders.tab.open'),
                isCurrentTab: false,
            },
        ]
    }, [])

    const onClick = React.useCallback(
        (route: string) => {
            const navigation =
                navigationTabsArray.find(
                    (n) => n.name.toLowerCase() === route.toLowerCase(),
                ) || navigationTabsArray[0]
            router.push(`/orders/${navigation.name}`)
        },
        [navigationTabsArray],
    )

    const renderNavigationTabs = React.useMemo(() => {
        return (
            <div className="w-full min-w-max pb-3">
                <NavTabs
                    tabs={navigationTabsArray}
                    onClick={onClick}
                    activeTabClassName={
                        'bg-primary-cta-color-10 text-primary-cta-color-90'
                    }
                    defaultTabClassName={
                        'bg-body-background-color text-neutral-control-layer-color-60 hover:bg-neutral-control-color-20'
                    }
                />
            </div>
        )
    }, [navigationTabsArray])

    return (
        <>
            <Head>
                <title>{appTitle(translate('page.tab.header.openOrders'))}</title>
            </Head>
            <Layout>
                <div className="flex flex-col h-screen w-full">
                    <div className={wrapperClassName}>
                        {!isMobile
                            ? renderNavigationTabs
                            : <></>}
                        <OrdersAll />
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default withAuth(OrdersAllHistory)
