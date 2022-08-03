import {
    useSetMobileDevice,
    Tab,
    withAuth,
    appTitle,
    NavTabs,
} from '@openware/opendax-web-sdk';
import classnames from 'classnames';
import { Layout } from '../../components';
import { useIntl } from 'react-intl';
import router from 'next/router';
import dynamic from 'next/dynamic'
import React,{ useCallback, useMemo } from 'react';
import Head from 'next/head';

const WithdrawsList = dynamic(() => import('@openware/opendax-web-sdk').then((mod: any) => mod.WithdrawsList), {
    ssr: false,
})

const WithdrawsHistoryList: React.FC = () => {
    const intl = useIntl();
    const isMobile = useSetMobileDevice();

    const wrapperClassName = classnames('flex flex-col h-full w-full pb-16', {
        'flex flex-col h-screen w-full p-6': !isMobile,
    });

    const translate = useCallback((id: string, value?: any) => intl.formatMessage({ id }, { ...value }), []);

    const navigationTabsArray = useMemo(() => {
            return [
            {
                name: 'deposits',
                label: translate('page.body.history.tab.deposit'),
                isCurrentTab: false,
            },
            {
                name: 'withdraws',
                label: translate('page.body.history.tab.withdraw'),
                isCurrentTab: true,
            },
        ];
    }, []);

    const onClick = useCallback((route: string) => {
        const navigation = navigationTabsArray.find(n => n.name.toLowerCase() === route.toLowerCase()) || navigationTabsArray[0]
        router.push(`/history/${navigation.name}`);
    }, [navigationTabsArray]);

    const renderNavigationTabs = useMemo(() => {
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
        );
    }, [navigationTabsArray]);

    const renderMobileNavigationTabs = React.useMemo(() => {
        return (
            <div className="w-full min-w-max p-5 border-b bg-navbar-background-color sticky top-0 z-10">
                <Tab
                    tabsContent={[translate('page.body.history.tab.deposit'), translate('page.body.history.tab.withdraw')]}
                    selectedContent={translate('page.body.history.tab.withdraw')}
                    mainClassName= "relative z-0 inline-flex rounded-md shadow-xs -space-x-px w-full h-9"
                    basicClassName="bg-navbar-background-color border-neutral-control-color-70 text-neutral-control-layer-color-40 hover:bg-gray-50 relative inline-flex items-center justify-content px-4 py-1 border text-sm font-medium leading-4 w-full justify-center"
                    selectedClassName="z-10 bg-primary-cta-color-10 text-primary-cta-color-90 relative inline-flex items-center justify-content px-4 py-1 text-sm leading-4 font-medium w-full justify-center"
                    onClick={onClick}
                />
            </div>
        );
    }, [navigationTabsArray]);

    return (
        <>
            <Head>
                <title>{appTitle(translate('page.tab.header.withdraws'))}</title>
            </Head>
            <Layout>
                <div className="flex flex-col h-screen w-full">
                    <div className={wrapperClassName}>
                        {!isMobile
                        ?renderNavigationTabs
                        :renderMobileNavigationTabs}
                        <WithdrawsList />
                    </div>
                </div>
            </Layout>
        </>
    )
};

export default withAuth(WithdrawsHistoryList);
