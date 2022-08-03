import assets from './assets.json'

export type Asset = {
  symbol: string
  logoURI?: string
  address: string
  balances?: number
  locked?: number
}

export default assets.map((asset: Asset) => {
  return asset
})
