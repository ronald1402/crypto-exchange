const fs = require('fs')
const path = require('path')
const ASSETS_FILE_NAME = 'data/assets.json'
const ASSETS_FILE = path.resolve(__dirname, '../', ASSETS_FILE_NAME)

start()

async function start() {
    let [index = 0, symbol, address, logoURI = ''] = process.argv.slice(2)
    if (!symbol) throw new Error('"symbol" is missing')
    if (!address) throw new Error('"address" is missing')

    symbol = symbol.toUpperCase()
    const assets = JSON.parse(fs.readFileSync(ASSETS_FILE, 'UTF-8'))
    let asset = assets.find(a => a.symbol === symbol)
    if (!asset) {
        asset = { symbol }
        assets.splice(index, 0, asset)
    }
    asset.address = address
    asset.logoURI = logoURI

    fs.writeFileSync(ASSETS_FILE, JSON.stringify(assets, null, 2), { flag: 'w' })
}
