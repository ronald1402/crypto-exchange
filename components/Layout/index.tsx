import {
    AccountButtonWidget,
    CookiePopup,
    DepositButton,
    DepositModal,
    Layout as SharedLayout,
    MarketSelectorWidget,
    navigation,
    navigationLoggedin,
    navigationMobile,
    navigationApp,
    navigationAppItem,
    SidebarProps,
    WithdrawButton,
    WithdrawModal,
    useAppSelector,
    useHandleWeb3Event,
    getConfigs,
} from '@openware/opendax-web-sdk'
import React, { PropsWithChildren, useMemo } from 'react'
import { useIntl } from 'react-intl'

export const { platformChainId } = getConfigs()

export function Layout(
    props: PropsWithChildren<{ className?: string }>,
): JSX.Element {
    const markets = useAppSelector((state) => state.markets.markets)
    const isLoggedin = useAppSelector((state) => state.user.user.id)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)
    const colorTheme = useAppSelector((state: any) => state.globalSettings.color);

    const intl = useIntl()

    useHandleWeb3Event()

    const navigations = useMemo((): navigationApp[] => {
        const mainNavigation = isLoggedin ? navigationLoggedin : navigation

        return [
            {
                app: 'mainapp',
                pathnames: mainNavigation.map<navigationAppItem>(
                    (nav: navigationAppItem) => {
                        if (nav.submenus?.length) {
                            return {
                                ...nav,
                                name: intl.formatMessage({
                                    id: `page.sidebar.navigation.${nav.name.toLowerCase()}`,
                                }),
                                submenus: nav.submenus.map((submenu: any) => {
                                    return {
                                        ...submenu,
                                        name: intl.formatMessage({
                                            id: `page.sidebar.navigation.${nav.name.toLowerCase()}.submenu.${submenu.name.toLowerCase()}`,
                                        }),
                                    }
                                }),
                            }
                        }

                        return {
                            ...nav,
                            name: intl.formatMessage({
                                id: `page.sidebar.navigation.${nav.name.toLowerCase()}`,
                            }),
                            path:
                                nav.path === '/trading' && markets?.length
                                    ? currentMarket
                                        ? `${nav.path}/${currentMarket.id}`
                                        : `${nav.path}/${markets[0].id}`
                                    : nav.path,
                        }
                    },
                ),
            },
        ]
    }, [isLoggedin, markets, currentMarket])

    const mobileNavigation = useMemo((): navigationApp[] => {
        if (!navigationMobile) return []

        return [
            {
                app: 'mainapp',
                pathnames: navigationMobile.map<navigationAppItem>(
                    (nav: navigationAppItem) => {
                        if (nav.submenus?.length) {
                            return {
                                ...nav,
                                name: intl.formatMessage({
                                    id: `page.sidebar.navigation.${nav.name.toLowerCase()}`,
                                }),
                                submenus: nav.submenus.map((submenu: any) => {
                                    return {
                                        ...submenu,
                                        name: intl.formatMessage({
                                            id: `page.sidebar.navigation.${nav.name.toLowerCase()}.submenu.${submenu.name.toLowerCase()}`,
                                        }),
                                    }
                                }),
                            }
                        }

                        return {
                            ...nav,
                            name: intl.formatMessage({
                                id: `page.sidebar.navigation.${nav.name.toLowerCase()}`,
                            }),
                            path:
                                nav.path === '/trading' && markets?.length
                                    ? currentMarket
                                        ? `${nav.path}/${currentMarket.id}`
                                        : `${nav.path}/${markets[0].id}`
                                    : nav.path,
                        }
                    },
                ),
            },
        ]
    }, [navigationMobile])

    const buttonsList = useMemo(() => {
        return isLoggedin
            ? [
                  {
                      name: 'Metamask',
                      component: <AccountButtonWidget />,
                      label: intl.formatMessage({
                          id: 'page.sidebar.bottom.wallet',
                      }),
                  },
                  {
                      name: 'Deposit',
                      component: <DepositButton />,
                      label: intl.formatMessage({
                          id: 'page.body.deposit.button.deposit',
                      }),
                  },
                  {
                      name: 'Withdraw',
                      component: <WithdrawButton />,
                      label: intl.formatMessage({
                          id: 'page.body.withdraw.button.withdraw',
                      }),
                  },
              ]
            : [
                  {
                      name: 'Metamask',
                      component: <AccountButtonWidget />,
                      label: intl.formatMessage({
                          id: 'page.sidebar.bottom.wallet',
                      }),
                  },
              ]
    }, [isLoggedin])

    const sidebarProps: SidebarProps = {
        currentApp: 'mainapp',
        navigations,
        mobileNavigation,
        classNames: 'bg-navbar-background-color sm:border-r border-divider-color-20',
        bottomClasses: 'fixed w-screen bottom-0 z-10 flex-shrink-0 md:hidden flex h-16 bg-navbar-background-color border-t border-divider-color-20 w-full left-0',
        navActiveClassNames: 'bg-navbar-control-bg-color-10 text-navbar-control-layer-color-60',
        navActiveSubmenuClassNames: 'text-navbar-control-layer-color-60',
        navInactiveClassNames: 'text-neutral-control-layer-color-60 hover:bg-navbar-control-bg-color-10',
        isLoggedin: false,
        buttonsList,
        colorTheme,
    }

    return (
        <SharedLayout
            containerClassName={props.className}
            sidebarProps={sidebarProps}
        >
            <>
                {props.children}
                <MarketSelectorWidget />
                <DepositModal />
                <WithdrawModal />
                <CookiePopup hideReadMore={false} />
            </>
        </SharedLayout>
    )
}
