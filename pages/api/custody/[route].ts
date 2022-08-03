import crypto from 'crypto'
import { recoverTypedSignature } from 'eth-sig-util'
import { ethers } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'
import vaultABI from '../../../contracts/simpleVault.abi.json'
import {
    chains,
    generateSignature,
    generateDepositWithdrawPayload,
    getConfigs,
    typedDataAPIKey,
    WithdrawalTimeout,
    WithdrawalType,
} from '@openware/opendax-web-sdk'

const FROM_BLOCK = 9441794

const AppState = {
    rid: Date.now(),
    accounts: {} as { [address: string]: Account },
}

const broker = new ethers.Wallet(process.env.BROKER_PRIVATE_KEY!)
const chain = chains.find((c) => c.chainId === +getConfigs().platformChainId)
const provider = new ethers.providers.WebSocketProvider(chain!.rpc[1]!)
const vaultContract = new ethers.Contract(
    getConfigs().finex_custody_contract_address!,
    vaultABI,
    provider,
)

type EventType = 'Deposited' | 'Withdrawn'

type Event = {
    event: EventType
    id: number
    asset: string
    amount: ethers.BigNumber
    rid?: string
}

type OrderType = 'buy' | 'sell'

type Order = {
    id?: any
    base: string
    quote: string
    side: OrderType
    amount: ethers.BigNumber
    price: string
    ts: number
}

type Balances = {
    [address: string]: ethers.BigNumber
}

const proxyDefaultBalances = {
    get(target: Balances, key: string) {
        return key in target ? target[key] : ethers.BigNumber.from(0)
    },
}

class Account {
    public address: string
    public history: Event[]
    public PnL: Balances
    public openOrders: Order[]
    public balances: Balances

    constructor(_address: string) {
        this.address = _address
        this.history = []
        this.PnL = new Proxy({}, proxyDefaultBalances)
        this.openOrders = []
        this.balances = new Proxy({}, proxyDefaultBalances)
    }

    async initialize() {
        await this.refreshBalances()
    }

    async refreshHistory() {
        this.history = await this.getEvents()
    }

    async refreshBalances() {
        await this.refreshHistory()
        const balances = this.history.reduce<Balances>((sum, e) => {
            if (!sum[e.asset]) sum[e.asset] = ethers.BigNumber.from('0')
            switch (e.event) {
                case 'Deposited': {
                    sum[e.asset] = sum[e.asset].add(e.amount)
                    break
                }
                case 'Withdrawn': {
                    sum[e.asset] = sum[e.asset].sub(e.amount)
                    break
                }
            }
            return sum
        }, {} as Balances)

        this.balances = new Proxy(balances, proxyDefaultBalances)
    }

    async getEvents() {
        const [deposits, withdraws] = await Promise.all([
            this.getContractEvent('Deposited', this.address),
            this.getContractEvent('Withdrawn', this.address),
        ])
        const events = [
            ...deposits.map((v) => this.parseEvent('Deposited', v)),
            ...withdraws.map((v) => this.parseEvent('Withdrawn', v)),
        ]
        return events
    }

    parseEvent(event: EventType, data: any): Event {
        return {
            event,
            id: data.id,
            asset: data.asset,
            amount: data.amount,
            rid: data.rid,
        }
    }

    async getContractEvent(event: EventType, account: string) {
        const deposited = await vaultContract.queryFilter(
            vaultContract.filters[event](null, account),
            FROM_BLOCK,
        )
        return deposited.map((d) => d.args!)
    }

    generateId() {
        return crypto.randomBytes(3 * 4).toString('hex')
    }

    createOrder(order: Order) {
        if (order.side === 'buy') {
            if (
                +this.balances[order.quote] <
                (order.amount as any) * (order.price as any)
            )
                throw new Error('CreateOrder: Insufficient quote currency')
        } else if (order.side === 'sell') {
            if (this.balances[order.base].lt(order.amount))
                throw new Error('CreateOrder: Insufficient base currency')
        }
        const newOrder = { ...order, id: this.generateId(), ts: Date.now() }
        this.openOrders.push(newOrder)
        return newOrder
    }

    cancelOrder(id: any) {
        const index = this.openOrders.findIndex((o) => o.id === id)
        let order: Order | null = null
        if (index !== -1) {
            order = this.openOrders[index]
            this.openOrders.splice(index, 1)
        }
        return order
    }

    executeOrder(id: any) {
        const order = this.cancelOrder(id)
        if (order) {
            const factor =
                order.side === 'buy' ? 1 : order.side === 'sell' ? -1 : 0
            const opposite = -1 * factor
            if (!this.PnL[order.base])
                this.PnL[order.base] = ethers.BigNumber.from(0)
            if (!this.PnL[order.quote])
                this.PnL[order.quote] = ethers.BigNumber.from(0)
            this.PnL[order.base] = this.PnL[order.base].add(
                order.amount.mul(factor),
            )
            this.PnL[order.quote] = this.PnL[order.quote].add(
                ethers.BigNumber.from(
                    (
                        (order.amount as any) *
                        (order.price as any) *
                        opposite
                    ).toString(),
                ),
            )
        }
        return order
    }

    getLockBalances() {
        return this.openOrders.reduce((sum, o) => {
            switch (o.side) {
                case 'buy': {
                    if (!sum[o.quote]) sum[o.quote] = ethers.BigNumber.from(0)
                    sum[o.quote] = ethers.BigNumber.from(
                        (
                            +sum[o.quote] +
                            (o.amount as any) * (o.price as any)
                        ).toString(),
                    )
                    break
                }
                case 'sell': {
                    if (!sum[o.base]) sum[o.base] = ethers.BigNumber.from(0)
                    sum[o.base] = sum[o.base].add(o.amount)
                    break
                }
            }
            return sum
        }, new Proxy({}, proxyDefaultBalances) as Balances)
    }

    getReportBalances() {
        this
        const balances = this.balances
        const PnL = this.PnL
        const locked = this.getLockBalances()
        const addresses = Array.from(
            new Set([
                ...Object.keys(balances),
                ...Object.keys(locked),
                ...Object.keys(PnL),
            ]),
        )
        return addresses.reduce((sum, address) => {
            const available = balances[address]
                .sub(locked[address])
                .add(PnL[address])
            sum[address] = {
                balances: balances[address].toString(),
                locked: locked[address].toString(),
                pnl: PnL[address].toString(),
                available: available.toString(),
            }
            return sum
        }, {} as { [address: string]: { balances: string; locked: string; pnl: string; available: string } })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>,
) {
    try {
        const { route } = req.query
        AppState.rid = Date.now() + Math.random()
        switch (route) {
            case 'withdraw': {
                const userAuthResult = await getAuthUserAddress(req, res)
                if (!userAuthResult) return
                return await withdraw(req, res, userAuthResult.address)
            }
            case 'balances': {
                const userAuthResult = await getAuthUserAddress(req, res)
                if (!userAuthResult) return
                return await getBalances(res, userAuthResult.address)
            }
            case 'create_order': {
                const userAuthResult = await getAuthUserAddress(req, res)
                if (!userAuthResult) return
                return await createOrder(req, res, userAuthResult.address)
            }
            case 'cancel_order': {
                const userAuthResult = await getAuthUserAddress(req, res)
                if (!userAuthResult) return
                return await cancelOrder(req, res, userAuthResult.address)
            }
            case 'execute_order': {
                const userAuthResult = await getAuthUserAddress(req, res)
                if (!userAuthResult) return
                return await executeOrder(req, res, userAuthResult.address)
            }
            case 'open_orders': {
                const userAuthResult = await getAuthUserAddress(req, res)
                if (!userAuthResult) return
                return await openOrders(res, userAuthResult.address)
            }
            case 'rid': {
                return await getRid(res)
            }
        }
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

export async function withdraw(
    req: NextApiRequest,
    res: NextApiResponse<any>,
    userAddress: string,
) {
    const data: Payload = req.body
    console.log('data:', data)

    const { destination, assets } = data

    if (!destination)
        return res.status(400).json({ error: 'destination is missing' })
    if (!assets || !assets.length)
        return res.status(400).json({ error: 'assets is missing' })
    if (destination.toLowerCase() !== userAddress.toLowerCase())
        return res.status(400).json({ error: 'invalid api-key' })

    const rid = ethers.utils.id(`${AppState.rid}`)
    const { payload: withdrawPayload, data: withdrawData } =
        generateDepositWithdrawPayload({
            rid,
            expire: Date.now() + WithdrawalTimeout,
            destination,
            assets: assets.map((a) => [
                a.asset,
                ethers.BigNumber.from(a.amount),
            ]),
        })

    const withdrawSig = await generateSignature(
        broker,
        WithdrawalType,
        withdrawPayload,
    )

    res.status(200).json({
        rid,
        expire: withdrawData.expire,
        signature: withdrawSig,
    })
}

export async function getBalances(
    res: NextApiResponse<any>,
    userAddress: string,
) {
    await AppState.accounts[userAddress].refreshBalances()
    const balances = AppState.accounts[userAddress].getReportBalances()
    res.status(200).json(balances)
}

export async function openOrders(
    res: NextApiResponse<any>,
    userAddress: string,
) {
    const orders = AppState.accounts[userAddress].openOrders
    res.status(200).json(
        orders.map((o) => ({
            ...o,
            amount: o.amount.toString(),
            price: o.price.toString(),
        })),
    )
}

export async function createOrder(
    req: NextApiRequest,
    res: NextApiResponse<any>,
    userAddress: string,
) {
    const {
        base,
        quote,
        side,
        amount,
        price,
    }: {
        base: string
        quote: string
        side: string
        amount: string
        price: string
    } = req.body

    if (!base) return res.status(400).json({ error: 'base is missing' })
    if (!quote) return res.status(400).json({ error: 'quote is missing' })
    if (!side) return res.status(400).json({ error: 'side is missing' })
    if (!amount) return res.status(400).json({ error: 'amount is missing' })
    if (!price) return res.status(400).json({ error: 'price is missing' })

    const order: any = {
        side: side as OrderType,
        base,
        quote,
        amount: ethers.BigNumber.from(amount),
        price,
    }

    await AppState.accounts[userAddress].refreshBalances()
    const newOrder = AppState.accounts[userAddress].createOrder(order)

    res.status(200).json({
        ...newOrder,
        amount: newOrder.amount.toString(),
        price: newOrder.price.toString(),
    })
}

export async function cancelOrder(
    req: NextApiRequest,
    res: NextApiResponse<any>,
    userAddress: string,
) {
    const { id }: { id: any } = req.body
    if (!id) return res.status(400).json({ error: 'id is missing' })

    const order = AppState.accounts[userAddress].cancelOrder(id)
    if (!order) {
        return res.status(400).json({ error: 'Order not found' })
    }
    res.status(200).json(order)
}

export async function executeOrder(
    req: NextApiRequest,
    res: NextApiResponse<any>,
    userAddress: string,
) {
    const { id }: { id: any } = req.body
    if (!id) return res.status(400).json({ error: 'id is missing' })

    const order = AppState.accounts[userAddress].executeOrder(id)
    if (!order) {
        return res.status(400).json({ error: 'Order not found' })
    }
    res.status(200).json(order)
}

export async function getRid(res: NextApiResponse<any>) {
    return res.status(200).json(AppState.rid)
}

///////////////////

async function getAuthUserAddress(
    req: NextApiRequest,
    res: NextApiResponse<any>,
) {
    console.log('req.headers:', req.headers)
    console.log('data:', req.body)
    const url = getHostUrl(req)
    const apiKey: string = (req.headers as any)['x-custody-api-key']
    console.log({ url, apiKey })

    if (!url) return res.status(400).json({ error: 'host is missing' })
    if (!apiKey)
        return res.status(400).json({ error: 'x-custody-api-key is missing' })

    const userAddress = await recoverAddressFromAPIKey(apiKey, url)
    console.log('userAddress:', userAddress)

    if (!AppState.accounts[userAddress])
        AppState.accounts[userAddress] = new Account(userAddress)
    return { address: userAddress }
}

type Payload = {
    destination: string
    assets: { asset: string; amount: string }[]
}

export async function recoverAddressFromAPIKey(key: string, url: string) {
    const typeData = typedDataAPIKey(
        {
            name: getConfigs().appName,
            version: getConfigs().appVersion,
            chainId: getConfigs().platformChainId,
            verifyingContract: getConfigs().finex_custody_contract_address!,
        },
        url,
    )
    const recoveredAddr = recoverTypedSignature({
        data: typeData as any,
        sig: key,
    })
    return recoveredAddr
}

export function getHostUrl(req: NextApiRequest) {
    const [hostname, port] = (req.headers.host ?? ':').split(':')
    const protocol = hostname === 'localhost' ? 'http' : 'https'
    return `${protocol}://${hostname}${port ? ':' + port : ''}`
}
