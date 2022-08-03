import React from 'react';
import Link from 'next/link';
import { AccountModal, useAppSelector, useDApp, useEagerConnect, useWallet } from '@openware/opendax-web-sdk';

export const DisconnectWizardPage: React.FC = () => {
    const [showModal, setModal] = React.useState(false);

    const { disconnect } = useDApp();
    const { account, chain } = useWallet();
    const user = useAppSelector((state) => state.user.user);
    const triedToEagerConnect = useEagerConnect()

    const handleDisconnect = React.useCallback(() => {
        disconnect();
        setModal(false);
    }, []);

    const handleConnectDisconnectClick = React.useCallback(() => {
        if (user.id) {
            setModal(!showModal);
        }
    }, [user, showModal]);


    if (!triedToEagerConnect) {
        return null
    }

    return (
        <React.Fragment>
            <p className="text-base leading-6 font-normal">
                Sorry, you cannot proceed, because you are not superadmin
            </p>
            <div className="my-6">
                <div className="cursor-pointer py-4 flow-root">
                    <button
                        className="inline-flex w-full justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-cta-layer-color-60 duration-200 bg-primary-cta-color-60 hover:bg-primary-cta-color-80 active:bg-primary-cta-color-90"
                        aria-label="Disconnect"
                        onClick={handleConnectDisconnectClick}
                    >
                        Disconnect
                    </button>
                </div>
                {account && chain && (
                    <AccountModal
                        open={showModal}
                        setOpen={setModal}
                        address={account}
                        chain={chain}
                        handleLogout={handleDisconnect}
                    />
                )}
            </div>
            <Link href="/">
                <a className="text-sm leading-5 font-semibold text-indigo-600">
                Any Problem ?
                </a>
            </Link>
        </React.Fragment>
    );
};
