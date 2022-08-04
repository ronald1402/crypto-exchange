import {
    klineFetch,
    openOrdersFetch,
    toggleWalletConnectModalOpen,
    useAppDispatch,
    useAppSelector,
    useSetMobileDevice,
    withAuth,
    setCurrentMarket,
    isBrowser,
    ConnectorWalletModal,
} from '@openware/opendax-web-sdk'
import classnames from 'classnames'
import { ChartAndOrderBookWidget, Layout } from '../../components'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'

const TradingChart = dynamic(() => import('@openware/opendax-web-sdk'), {
    ssr: false,
})

const Toolbar = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.Toolbar), {
    ssr: false,
})

const BalancesWidget = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.BalancesWidget), {
    ssr: false,
})

const OpenOrdersWidget = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.OpenOrdersWidget), {
    ssr: false,
})

const OrderBookWidget = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.OrderBookWidget), {
    ssr: false,
})

const OrderFormWidget = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.OrderFormWidget), {
    ssr: false,
})

const TradingByMarket: FC<{}> = (): JSX.Element => {
    // const intl = useIntl()

    const router = useRouter()
    const { marketID } = router.query
    const markets = useAppSelector((state) => state.markets.markets)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)
    const isWalletConnectModalOpen = useAppSelector(
        (state) => state.globalSettings.isWalletConnectModalOpen,
    )
    const marketSelectorActive = useAppSelector(
        (state) => state.globalSettings.marketSelectorActive,
    )
    const isMobile = useSetMobileDevice()
    const isHorizontalMobile = useSetMobileDevice(true)

    // const translate = useCallback(
    //     (id: string) => intl.formatMessage({ id }),
    //     [],
    // )

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!markets.length) {
            dispatch(klineFetch())
            dispatch(openOrdersFetch())
        }
    }, [])

    useEffect(() => {
        if (isBrowser() && currentMarket) {
            localStorage.setItem('last_market', currentMarket.id)
        }
    }, [isBrowser, currentMarket])

    useEffect(() => {
        if (currentMarket && currentMarket.id === marketID) {
            return
        }

        if (!marketID) {
            return
        }

        const marketIDFromRoute = (marketID as string).toLowerCase()
        const marketFromRoute = markets.find(
            (market) => market.id.toLowerCase() === marketIDFromRoute,
        )
        const [fallbackMarket] = markets
        if (marketFromRoute) {
            dispatch(setCurrentMarket(marketFromRoute || fallbackMarket))
        } else {
            fallbackMarket?.id && router.push(`/trading/${fallbackMarket.id}`)
        };
    }, [markets, marketID, isBrowser])

    const cnWrapper = useMemo(() => {
        return classnames('flex flex-col md:flex-row h-screen w-full', {
            'blur-sm': marketSelectorActive,
        })
    }, [marketSelectorActive])

    const renderDesktop = useMemo(() => {
        return (
            <>
                <div className={cnWrapper}>
                    <div className="flex flex-col w-full md:w-3/5 xl:w-7/12 flex-grow">
                        <div className="toolbar w-full h-1/6 max-h-16 p-1">
                            <Toolbar />
                        </div>
                        <div className="toolbar w-full h-4/6 px-1">
                            <TradingChart />
                        </div>
                        <div className="toolbar w-full h-2/6 p-1">
                            <OpenOrdersWidget />
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/5 xl:w-60 2xl:w-64">
                        <div className="toolbar w-full h-full py-1">
                            <OrderBookWidget />
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-1/5 xl:w-64 2xl:w-80">
                        <div className="toolbar w-full h-auto p-1">
                            <OrderFormWidget />
                        </div>
                        <div className="toolbar w-full h-full p-1 overflow-auto">
                            <BalancesWidget />
                        </div>
                    </div>
                </div>
                <ConnectorWalletModal
                    showModal={isWalletConnectModalOpen}
                    handleModal={() => dispatch(toggleWalletConnectModalOpen())}
                />
            </>
        )
    }, [isMobile, isWalletConnectModalOpen])

    const renderMobile = useMemo(() => {
        return (
            <div className="w-full">
                <Toolbar />
                <div className={cnWrapper}>
                    <div className="flex flex-col w-full flex-grow">
                        <ChartAndOrderBookWidget />
                    </div>
                </div>
            </div>
        )
    }, [isMobile])

    const layoutClassName = useMemo(() =>
        classnames('flex flex-grow', {
            'overflow-hidden': !isHorizontalMobile,
        }
    ), [isHorizontalMobile]);

    return (
        <>
            <Head>
                <title>Test Title</title>
            </Head>
            <Layout className={layoutClassName}>
                {(isMobile && isHorizontalMobile) ? renderMobile : renderDesktop}
            </Layout>
        </>
    )
}

export default withAuth(TradingByMarket)
