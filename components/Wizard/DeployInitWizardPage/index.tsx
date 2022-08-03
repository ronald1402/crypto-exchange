import React from 'react';
import Link from 'next/link';
import { Dropdown, DropdownItem, useEagerConnect } from '@openware/opendax-web-sdk';

interface DeployInitWizardPageProps {
    vaultName: string;
    handleSetVaultName: (value: string) => void;
    selectedBlockchainNetwork: DropdownItem | undefined;
    blockchainNetworks: any[];
    handleSelectionOfBlockchainNetwork: (value: any) => void;
}

export const DeployInitWizardPage: React.FC<DeployInitWizardPageProps> = ({
    vaultName,
    handleSetVaultName,
    selectedBlockchainNetwork,
    blockchainNetworks,
    handleSelectionOfBlockchainNetwork,
}: DeployInitWizardPageProps) => {
    const triedToEagerConnect = useEagerConnect()

    if (!triedToEagerConnect) {
        return null
    }

    return (
        <React.Fragment>
            <div className="mt-6">
                <p className="text-sm leading-5 font-medium text-gray-700 mb-1">
                    Blockchain network
                </p>
                <Dropdown
                    list={blockchainNetworks}
                    selected={selectedBlockchainNetwork as DropdownItem}
                    onSelect={handleSelectionOfBlockchainNetwork}
                    buttonClassNames="w-full cursor-pointer text-base leading-6 font-normal border border-gray-300 text-gray-800 rounded-md px-3 py-2"
                />
            </div>
            <div className="my-3">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Custody name
                </label>
                <div className="flex mt-1">
                    <div className="flex-1">
                        <input
                            type="text"
                            name="vault_name"
                            className="shadow-sm text-base leading-6 font-normal text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 block w-full border-gray-300 rounded-md"
                            value={vaultName}
                            onChange={e => handleSetVaultName(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <Link href="/">
                <a className="text-sm leading-5 font-semibold text-indigo-600 border-b border-color-indigo-600">
                    What is the custody contract?
                </a>
            </Link>
        </React.Fragment>
    );
};
