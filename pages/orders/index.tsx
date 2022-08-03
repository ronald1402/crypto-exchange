import * as React from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@openware/opendax-web-sdk';

const Orders: React.FC = () => {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/orders/all');
    }, []);

    return null;
}

export default withAuth(Orders);
