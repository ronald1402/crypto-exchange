import { useEagerConnect } from '@openware/opendax-web-sdk';
import classNames from 'classnames';
import Link from 'next/link';
import React, { useState , useEffect} from 'react';

interface DeployWizardPageProps {
    deployLoading: boolean;
    txHash: string;
    deployedAddress: string;
}

export const DeployWizardPage: React.FC<DeployWizardPageProps> = ({
    deployLoading,
    txHash,
    deployedAddress,
}: DeployWizardPageProps) => {
    const triedToEagerConnect = useEagerConnect();
    const [addressCopyClicked, setAddressCopyClicked] = useState(false);
    const [hashCopyClicked, setHashCopyClicked] = useState(false);

    const handleCopyAddress = React.useCallback((value: string, clickHandler: any) => {
        navigator.clipboard.writeText(value);
        clickHandler(true);
    }, []);

    useEffect(() => {
        if (addressCopyClicked) {
            const timeout = setTimeout(() => {
                setAddressCopyClicked(false);
            }, 800);

            return () => {
                clearTimeout(timeout);
            }
        }
    }, [addressCopyClicked]);

    useEffect(() => {
        if (hashCopyClicked) {
            const timeout = setTimeout(() => {
                setHashCopyClicked(false);
            }, 800);

            return () => {
                clearTimeout(timeout);
            }
        }
    }, [hashCopyClicked]);

    const renderContent = React.useMemo(() => {
        if (!triedToEagerConnect) {
            return null;
        }

        if (deployLoading) {
            return (
                <div className="flex flex-row mt-8">
                    <div className="mr-4">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-l-4 border-divider-color-20 rounded-full text-blue-600" role="status" />
                    </div>
                    <div>
                        <div className="text-xs leading-4 font-semibold tracking-wide uppercase text-primary-cta-color-60">
                            Init
                        </div>
                        <div className="text-sm leadeing-5 font-normal text-gray-500">
                            Loading
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="flex mt-8">
                    <div className="mr-4">
                        <div className="w-8 h-8 bg-customization-primary-cta-color rounded-2xl pt-1 pl-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="white">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs leading-4 font-semibold tracking-wide uppercase text-primary-cta-color-60">
                            Init
                        </div>
                        <div className="text-sm leadeing-5 font-normal text-gray-500">
                            Vitae sed mi luctus laoreet.
                        </div>
                    </div>
                </div>
                <div className="flex flex-col mt-1">
                    <div className="mt-3">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Transaction hash
                        </label>
                        <div className="flex mt-1">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={txHash}
                                    readOnly={true}
                                />
                            </div>
                            <div className="flex-none ml-2 relative" onClick={() => handleCopyAddress(txHash, setHashCopyClicked)}>
                                <div className={classNames('absolute -top-7 -left-4', {'hidden': !hashCopyClicked})}>
                                    <div className="bg-body-background-color border border-divider-color-20 rounded px-2.5 shadow text-sm text-gray-700">
                                        Copied
                                    </div>
                                </div>
                                <div className="p-2.5 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 active:scale-95">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.9 7.2C9.9 6.70294 9.49706 6.3 9 6.3H2.7C2.20294 6.3 1.8 6.70294 1.8 7.2V15.3C1.8 15.7971 2.20294 16.2 2.7 16.2H9C9.49706 16.2 9.9 15.7971 9.9 15.3V7.2ZM0.9 4.5C0.402944 4.5 0 4.90294 0 5.4V17.1C0 17.5971 0.402944 18 0.9 18H10.8C11.2971 18 11.7 17.5971 11.7 17.1V5.4C11.7 4.90294 11.2971 4.5 10.8 4.5H0.9Z" fill="#5A6689"/>
                                        <path d="M9 1.8H15.3C15.7971 1.8 16.2 2.20294 16.2 2.7V11.7C16.2 12.1971 15.7971 12.6 15.3 12.6H13.05V14.4H17.1C17.5971 14.4 18 13.9971 18 13.5V0.9C18 0.402944 17.5971 0 17.1 0H7.2C6.70294 0 6.3 0.402944 6.3 0.9V3.6L8.1 3.6V2.7C8.1 2.20294 8.50294 1.8 9 1.8Z" fill="#5A6689"/>
                                    </svg>
                                </div>
                            </div>
                            <Link href={`https://rinkeby.etherscan.io/tx/${txHash}`}>
                                <a target="_blank" className="flex-none ml-2">
                                    <div className="p-2.5 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 active:scale-95">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.1672 1.13854e-05L10.1022 0.0466722C9.64601 0.0490038 9.27817 0.421709 9.28109 0.877229C9.284 1.33275 9.65655 1.69961 10.1139 1.6961L15.1629 1.66285L8.35349 8.45366C8.03008 8.77619 8.03008 9.2976 8.35349 9.62013C8.67691 9.94267 9.19978 9.9427 9.5232 9.62016L16.3326 2.82936L16.2993 7.86455C16.2958 8.32064 16.6642 8.69159 17.1204 8.6951C17.3508 8.69628 17.5602 8.60412 17.7111 8.45363C17.8597 8.30547 17.952 8.10136 17.9532 7.87621L18 0.830514C18.0012 0.61005 17.9146 0.397734 17.7579 0.241432C17.6012 0.085185 17.3895 -0.00114073 17.1672 1.13854e-05Z" fill="#5A6689"/>
                                            <path d="M2.51417 16.3504C2.05761 16.3504 1.68709 15.9808 1.68709 15.5255L1.65421 2.63864C1.65421 2.18332 2.02477 1.81382 2.4813 1.81382H4.94619C5.40357 1.81382 5.77328 1.44512 5.77328 0.988991C5.77328 0.532859 5.40357 0.164089 4.94619 0.164089H2.4813C1.11327 0.164089 0 1.27436 0 2.63864L0.032878 15.5255C0.032878 16.8898 1.14615 18 2.51417 18L15.4722 17.9995C16.8402 17.9995 17.9535 16.8892 17.9535 15.525V12.866C17.9535 12.4099 17.5837 12.0412 17.1264 12.0412C16.669 12.0412 16.2993 12.4099 16.2993 12.866V15.525C16.2993 15.9802 15.9288 16.3498 15.4722 16.3498L2.51417 16.3504Z" fill="#5A6689"/>
                                        </svg>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-3">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Vault address
                        </label>
                        <div className="flex mt-1">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={deployedAddress}
                                    readOnly={true}
                                />
                            </div>
                            <div className="flex-none ml-2 relative" onClick={() => handleCopyAddress(deployedAddress, setAddressCopyClicked)}>
                                <div className={classNames('absolute -top-7 -left-4', {'hidden': !addressCopyClicked})}>
                                    <div className="bg-body-background-color border border-divider-color-20 rounded px-2.5 shadow text-sm text-gray-700">
                                        Copied
                                    </div>
                                </div>
                                <div className="p-2.5 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 active:scale-95">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.9 7.2C9.9 6.70294 9.49706 6.3 9 6.3H2.7C2.20294 6.3 1.8 6.70294 1.8 7.2V15.3C1.8 15.7971 2.20294 16.2 2.7 16.2H9C9.49706 16.2 9.9 15.7971 9.9 15.3V7.2ZM0.9 4.5C0.402944 4.5 0 4.90294 0 5.4V17.1C0 17.5971 0.402944 18 0.9 18H10.8C11.2971 18 11.7 17.5971 11.7 17.1V5.4C11.7 4.90294 11.2971 4.5 10.8 4.5H0.9Z" fill="#5A6689"/>
                                        <path d="M9 1.8H15.3C15.7971 1.8 16.2 2.20294 16.2 2.7V11.7C16.2 12.1971 15.7971 12.6 15.3 12.6H13.05V14.4H17.1C17.5971 14.4 18 13.9971 18 13.5V0.9C18 0.402944 17.5971 0 17.1 0H7.2C6.70294 0 6.3 0.402944 6.3 0.9V3.6L8.1 3.6V2.7C8.1 2.20294 8.50294 1.8 9 1.8Z" fill="#5A6689"/>
                                    </svg>
                                </div>
                            </div>
                            <Link href={`https://rinkeby.etherscan.io/address/${deployedAddress}`}>
                                <a target="_blank" className="flex-none ml-2">
                                    <div className="p-2.5 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 active:scale-95">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.1672 1.13854e-05L10.1022 0.0466722C9.64601 0.0490038 9.27817 0.421709 9.28109 0.877229C9.284 1.33275 9.65655 1.69961 10.1139 1.6961L15.1629 1.66285L8.35349 8.45366C8.03008 8.77619 8.03008 9.2976 8.35349 9.62013C8.67691 9.94267 9.19978 9.9427 9.5232 9.62016L16.3326 2.82936L16.2993 7.86455C16.2958 8.32064 16.6642 8.69159 17.1204 8.6951C17.3508 8.69628 17.5602 8.60412 17.7111 8.45363C17.8597 8.30547 17.952 8.10136 17.9532 7.87621L18 0.830514C18.0012 0.61005 17.9146 0.397734 17.7579 0.241432C17.6012 0.085185 17.3895 -0.00114073 17.1672 1.13854e-05Z" fill="#5A6689"/>
                                            <path d="M2.51417 16.3504C2.05761 16.3504 1.68709 15.9808 1.68709 15.5255L1.65421 2.63864C1.65421 2.18332 2.02477 1.81382 2.4813 1.81382H4.94619C5.40357 1.81382 5.77328 1.44512 5.77328 0.988991C5.77328 0.532859 5.40357 0.164089 4.94619 0.164089H2.4813C1.11327 0.164089 0 1.27436 0 2.63864L0.032878 15.5255C0.032878 16.8898 1.14615 18 2.51417 18L15.4722 17.9995C16.8402 17.9995 17.9535 16.8892 17.9535 15.525V12.866C17.9535 12.4099 17.5837 12.0412 17.1264 12.0412C16.669 12.0412 16.2993 12.4099 16.2993 12.866V15.525C16.2993 15.9802 15.9288 16.3498 15.4722 16.3498L2.51417 16.3504Z" fill="#5A6689"/>
                                        </svg>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [triedToEagerConnect, deployLoading, txHash, deployedAddress, addressCopyClicked, hashCopyClicked]);

    return renderContent;
};
