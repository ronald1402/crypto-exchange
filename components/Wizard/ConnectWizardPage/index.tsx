import React from 'react';
import { AccountButtonWidget } from '@openware/opendax-web-sdk';
import Link from 'next/link';

export const ConnectWizardPage: React.FC = () => {
    return (
        <React.Fragment>
            <p className="text-base leading-6 font-normal">
                Your platform is successfully deployed, follow the next
                steps to finalize your deployment
            </p>
            <div className="my-6">
                <AccountButtonWidget />
            </div>
            <Link href="/">
                <a className="text-sm leading-5 font-semibold text-indigo-600">
                    Any Problem ?
                </a>
            </Link>
        </React.Fragment>
    );
};
