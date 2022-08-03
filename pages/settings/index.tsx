import {
    AccountModal,
    ConnectorWalletModal,
    LanguageSelectorWidget,
    useAppDispatch,
    useAppSelector,
    toggleWalletConnectModalOpen,
    useDApp,
    useWallet,
    ConnectionTypeSwitcherWidget,
    CustomizationSwitcherWidget,
    appTitle,
} from '@openware/opendax-web-sdk'
import { Layout } from '../../components'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import React, { FC, useCallback, useState } from 'react'
import { useIntl } from 'react-intl'

// @ts-ignore
const ThemeSwitcher = dynamic(() => import('@openware/opendax-web-sdk').then((mod) => mod.ThemeSwitcherWidget), {
    loading: () => <p>Loading...</p>,
    ssr: false,
})

const SettingsPage: FC = () => {
    const intl = useIntl()

    const dispatch = useAppDispatch()
    const { active, account, chain } = useWallet()
    const { disconnect } = useDApp()
    const [showModal, setModal] = useState(false)

    const user = useAppSelector((state) => state.user.user)
    const isWalletConnectModalOpen = useAppSelector(
        (state) => state.globalSettings.isWalletConnectModalOpen,
    )

    const translate = useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    const handleDisconnect = useCallback(() => {
        setModal(false)
        disconnect()
    }, [])

    const handleConnectDisconnectClick = useCallback(() => {
        if (user.id && active) {
            setModal(!showModal)
        } else {
            dispatch(toggleWalletConnectModalOpen())
        }
    }, [user, active])

    const connectOrDisconnectWalletText = translate(
        `page.body.settings.rows.${
            user.id && active ? 'disconnect' : 'connect'
        }`,
    )

    return (
        <>
            <Head>
                <title>{appTitle(translate('page.tab.header.settings'))}</title>
            </Head>
            <Layout>
                <div className="flex flex-col h-screen w-full p-6 bg-body-background-color">
                    <div className="border-b border-divider-color-20 pb-6">
                        <span className="text-text-color-100 text-2xl leading-8 font-semibold">
                            {translate('page.body.settings.header.label')}
                        </span>
                    </div>
                    <div className="border-b border-divider-color-20 py-4 flow-root">
                        <div className="float-left h-full flex items-center">
                            <span className="text-text-color-90 text-lg leading-6 font-medium">
                                {translate('page.body.settings.rows.language')}
                            </span>
                        </div>
                        <div className="float-right">
                            <LanguageSelectorWidget />
                        </div>
                    </div>
                    <div className="border-b border-divider-color-20 py-4 flow-root">
                        <div className="float-left h-full flex items-center">
                            <span className="text-text-color-90 text-lg leading-6 font-medium">
                                {translate('page.body.settings.rows.theme')}
                            </span>
                        </div>
                        <div className="float-right">
                            <ThemeSwitcher />
                        </div>
                    </div>
                    {user.role === 'superadmin' ?
                        <div className="border-b border-divider-color-20 py-4 flow-root">
                            <div className="float-left h-full flex items-center">
                                <span className="text-text-color-90 text-lg leading-6 font-medium">
                                    {translate('page.body.settings.rows.customization')}
                                </span>
                            </div>
                            <div className="float-right">
                                <CustomizationSwitcherWidget />
                            </div>
                        </div>
                        : null
                    }
                    <div className="border-b border-divider-color-20 py-4 flow-root">
                        <div className="float-left h-full flex items-center">
                            <span className="text-text-color-90 text-lg leading-6 font-medium">
                                {translate('page.body.settings.rows.connection.type')}
                            </span>
                        </div>
                        <div className="float-right">
                            <ConnectionTypeSwitcherWidget />
                        </div>
                    </div>
                    <div onClick={handleConnectDisconnectClick} className="cursor-pointer border-b border-divider-color-20 py-4 flow-root">
                        <div className="float-left h-full flex items-center">
                            <span className="text-text-color-90 text-lg leading-6 font-medium">
                                {connectOrDisconnectWalletText}
                            </span>
                        </div>
                        <button
                            className="border-none bg-transparent float-right"
                            aria-label={connectOrDisconnectWalletText}
                        >
                            <svg
                                width="18"
                                height="20"
                                viewBox="0 0 18 20"
                                fill="none"
                            >
                                <path
                                    d="M2 13H4V18H16V2H4V7H2V1C2 0.734784 2.10536 0.48043 2.29289 0.292893C2.48043 0.105357 2.73478 0 3 0H17C17.2652 0 17.5196 0.105357 17.7071 0.292893C17.8946 0.48043 18 0.734784 18 1V19C18 19.2652 17.8946 19.5196 17.7071 19.7071C17.5196 19.8946 17.2652 20 17 20H3C2.73478 20 2.48043 19.8946 2.29289 19.7071C2.10536 19.5196 2 19.2652 2 19V13ZM8 9V6L13 10L8 14V11H0V9H8Z"
                                    fill="var(--app-neutral-control-layer-color-40)"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                {account && chain && (
                    <AccountModal
                        open={showModal}
                        setOpen={setModal}
                        address={account}
                        chain={chain}
                        handleLogout={() => handleDisconnect()}
                    />
                )}
                <ConnectorWalletModal
                    showModal={isWalletConnectModalOpen}
                    handleModal={() => dispatch(toggleWalletConnectModalOpen())}
                />
            </Layout>
        </>
    )
}

export default SettingsPage
