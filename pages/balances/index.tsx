import {
    BalancesWidget,
    useSetMobileDevice,
    withAuth,
} from '@openware/opendax-web-sdk'
import { Layout } from '../../components'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'

const Balances: FC = (): JSX.Element | null => {
    const router = useRouter()
    const isMobileDevice = useSetMobileDevice()

    useEffect(() => {
        if (!isMobileDevice && typeof isMobileDevice !== 'undefined') {
            router.push('/trading')
        }
    }, [isMobileDevice])

    if (!isMobileDevice) {
        return null
    }

    return (
        <Layout>
            <BalancesWidget />
        </Layout>
    )
}

export default withAuth(Balances)
