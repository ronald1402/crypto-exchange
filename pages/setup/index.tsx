import { ethers } from 'ethers';
import FactoryArtifacts from '../../contracts/SimpleVaultFactory.json';
import FactoryAddresses from '../../configs/custody_factory.json';
import {
    appTitle,
    chains,
    dispatchAlert,
    getConfigs,
    useAppSelector,
    useConfigs,
    useSetMobileDevice,
    useSetConfigs,
    DropdownItem,
    useWallet,
    useAppDispatch,
    toggleIsSetupMode,
} from '@openware/opendax-web-sdk';
import { ConnectWizardPage } from '../../components/Wizard/ConnectWizardPage';
import { DeployInitWizardPage } from '../../components/Wizard/DeployInitWizardPage';
import { DeployWizardPage } from '../../components/Wizard/DeployWizardPage';
import { DisconnectWizardPage } from '../../components/Wizard/DisconnectWizardPage';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@openware/opendax-web-sdk/configs/chains';
import Image from 'next/image';

const WizardPage: React.FC = (): JSX.Element => {
    const [finexVaultContractAddress, setFinexVaultContractAddress] = React.useState<string>(getConfigs().finex_custody_contract_address);
    const [deployLoading, setDeployLoading] = React.useState<boolean>(false);
    const [txHash, setTxHash] = React.useState<string>("");
    const [deployedAddress, setDeployedAddress] = React.useState<string>("");
    const [isDeployed, setIsDeployed] = React.useState<boolean>(false);
    const [vaultName, setVaultName] = React.useState<string>('');
    const [selectedBlockchainNetwork, setSelectedBlockchainNetwork] = React.useState<DropdownItem>();

    const user = useAppSelector((state) => state.user.user);
    const isSetupMode = useAppSelector((state) => state.globalSettings.isSetupMode);

    const { signer } = useWallet();
    const isMobile = useSetMobileDevice();
    const router = useRouter();
    const setConfigs = useSetConfigs();
    const dispatch = useAppDispatch();
    const brokerPublicKey = getConfigs().finex_custody_broker_public_key;

    const targetChain = React.useMemo(() => {
        return chains.find((c: Chain) => c.chainId === 4);
    }, [chains]);

    useConfigs();

    const blockchainNetworks = chains
        .map((chain: any) => chain.name)
        .filter((chain: any) => chain.includes('Rinkeby'));

    const dropdownBlockchainNetworks = React.useMemo(() => {
        return blockchainNetworks.map((network: string, index: number) => {
            return { id: index, value: network }
        });
    }, [blockchainNetworks]);

    React.useEffect(() => {
        setSelectedBlockchainNetwork(dropdownBlockchainNetworks[0]);
      }, []);

    React.useEffect(() => {
        setFinexVaultContractAddress(getConfigs().finex_custody_contract_address)
    }, [getConfigs().finex_custody_contract_address])

    React.useEffect(() => {
        if (!isSetupMode) {
            router.push('/settings');
        }
    }, [isSetupMode]);

    const handleSelectionOfBlockchainNetwork = React.useCallback((item: any) => {
        setSelectedBlockchainNetwork(item);
    }, []);

    const warningMessage = React.useMemo(() => {
        return (
            <>
                <div><FormattedMessage id="modal.deposit.invalid.network" /></div>
                <div><FormattedMessage id="modal.deposit.invalid.makeSure" /> <span className="font-bold">{targetChain?.name}</span></div>
            </>
        );
    }, [targetChain]);

    const handleDeployClick = React.useCallback(async () => {
        // NOTE: only rinkeby is supported for now
        if (await signer?.getChainId() != 4) {
            dispatch(dispatchAlert({ messageText: warningMessage, type: 'error' }));

            return;
        }

        setDeployLoading(true);

        // undefined signer when user has not connected a wallet
        if (signer && brokerPublicKey) {
            const factoryFactory = new ethers.ContractFactory(
                FactoryArtifacts.abi,
                FactoryArtifacts.bytecode,
                signer
            );
            const FactoryContract = factoryFactory.attach(FactoryAddresses.rinkeby);

            try {
                const tx = await FactoryContract.deployVault(
                    vaultName,
                    brokerPublicKey,
                );

                setTxHash(tx.hash);

                const result = await tx.wait();
                const vaultDeployedEv = result.events!.find((e: any) => e.event === 'VaultDeployed');
                const vaultAddress = vaultDeployedEv!.args!.vaultAddress;

                setDeployedAddress(vaultAddress);
                setConfigs(vaultAddress, 'finex_custody_contract_address');
                setIsDeployed(true);
            } catch (revertedTx: any) {
                // TODO: UI for revert reason
                const revertReason = revertedTx.error ? revertedTx.error.message : revertedTx.message;
                console.log(revertReason);
            }
        }

        setDeployLoading(false);
    }, [vaultName, brokerPublicKey]);

    const handleOpenPlatformClick = React.useCallback(() => {
        dispatch(toggleIsSetupMode(false));
        setFinexVaultContractAddress(deployedAddress);
    }, []);

    const contentLabels = React.useMemo(() => {
        if (user.id) {
            if (user.role === 'superadmin') {
                if (deployLoading || isDeployed) {
                    return {
                        title: 'Deployment',
                        content: (
                            <DeployWizardPage
                                deployLoading={deployLoading}
                                txHash={txHash}
                                deployedAddress={deployedAddress}
                            />
                        ),
                        imageLink: '/images/wizard_page_2.png',
                        bottomBlock: (
                            <div className="w-full flex justify-between items-center">
                                <div className="flex text-base leading-6 font-normal text-customization-primary-text-color">
                                    {deployLoading && "Your contract is being deployed"}
                                </div>
                                <div className="flex">
                                    <button
                                        className="py-2 px-14 bg-indigo-600 rounded-md text-white text-sm leading-5 font-medium shadow-sm disabled:opacity-30"
                                        onClick={handleOpenPlatformClick}
                                        disabled={!isDeployed}
                                    >
                                        Open platform
                                    </button>
                                </div>
                            </div>
                        ),
                    };
                }
                return {
                    title: 'Deploy your custody contract',
                    content: (
                        <DeployInitWizardPage
                            vaultName={vaultName}
                            handleSetVaultName={setVaultName}
                            selectedBlockchainNetwork={selectedBlockchainNetwork}
                            blockchainNetworks={blockchainNetworks}
                            handleSelectionOfBlockchainNetwork={handleSelectionOfBlockchainNetwork}
                        />
                    ),
                    imageLink: '/images/wizard_page_2.png',
                    bottomBlock: (
                        <div className="flex flex-row justify-end mt-3 items-center">
                            {brokerPublicKey ? (
                                <button
                                    className="py-2 px-9 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-sm leading-5 font-medium text-gray-700"
                                    onClick={handleDeployClick}
                                >
                                    Deploy
                                </button>
                             ) : (
                                <span className="text-system-red-60">
                                    The broker public key is missing from config, please generate it and try again
                                </span>
                             )}
                        </div>
                    ),
                };
            } else {
                return {
                    title: 'Sorry, you cannot proceed',
                    content: <DisconnectWizardPage />,
                    imageLink: '/images/wizard_page_2.png',
                    bottomBlock: null,
                };
            }
        } else {
            return {
                title: 'Welcome!',
                content: <ConnectWizardPage />,
                imageLink: '/images/wizard_page_1.png',
                bottomBlock: null,
            };
        }
    }, [user.id, user.role, brokerPublicKey, finexVaultContractAddress, deployLoading, isDeployed, vaultName, selectedBlockchainNetwork, blockchainNetworks]);

    const renderWizardContent = React.useMemo(() => {
        return (
            <div className="flex flex-row w-100 h-screen">
                {!isMobile && (
                    <div className="basis-1/2 relative">
                        <Image className="h-screen w-full" alt="" src={contentLabels.imageLink} layout="fill" />
                    </div>
                )}
                <div className="p-4 sm:px-16 sm:py-16 flex flex-col justify-between absolute right-0 bg-white h-screen w-1/2">
                    <div>
                        <h1 className="text-4xl leading-10 font-extrabold tracking-tight mb-3">
                            {contentLabels.title}
                        </h1>
                        {contentLabels.content}
                    </div>
                    <div>
                        {contentLabels.bottomBlock}
                    </div>
                </div>
            </div>
        );
    }, [isMobile, contentLabels, user]);

    return (
        <>
            <Head>
                <title>{appTitle('Wizard')}</title>
            </Head>
            {renderWizardContent}
        </>
    );
}

export default WizardPage;
