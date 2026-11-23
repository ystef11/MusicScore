const BUY_CURRENCY_USD = 'USD'
const BUY_CURRENCY_EUR = 'EUR'
const BUY_CURRENCY_GBP = 'GBP'
const BUY_CURRENCY_CAD = 'CAD'
const BUY_CURRENCY_AUD = 'AUD'
const BUY_CURRENCY_NZD = 'NZD'
const BUY_CURRENCY_RUB = 'RUB'
const BUY_CURRENCY_MXN = 'MXN'
const BUY_CURRENCY_PLN = 'PLN'
const BUY_CURRENCY_CHF = 'CHF'
const BUY_CURRENCY_CZK = 'CZK'
const BUY_CURRENCY_BRL = 'BRL'
const BUY_CURRENCY_JPY = 'JPY'
const BUY_CURRENCY_KRW = 'KRW'

const normalizePrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

type IGetPriceWithCurrencyProps = {
    price: number
    currency?: string
}

export const getPriceWithCurrency = ({
    price: inputPrice,
    currency = BUY_CURRENCY_USD,
}: IGetPriceWithCurrencyProps) => {
    if (!inputPrice) return ''

    const priceWith2Fixed = inputPrice.toFixed(2)
    const price = inputPrice % 1 ? priceWith2Fixed : inputPrice

    const currencyPrefixMap: Record<string, string> = {
        [BUY_CURRENCY_USD]: `$${price}`,
        [BUY_CURRENCY_EUR]: `${price} €`,
        [BUY_CURRENCY_GBP]: `£${price}`,
        [BUY_CURRENCY_CAD]: `C$${price}`,
        [BUY_CURRENCY_AUD]: `A$${price}`,
        [BUY_CURRENCY_NZD]: `$${price}`,
        [BUY_CURRENCY_RUB]: `${price} ₽`,
        [BUY_CURRENCY_MXN]: `Mex$${price}`,
        [BUY_CURRENCY_PLN]: `${price} zł`,
        [BUY_CURRENCY_CHF]: `${price} Fr.`,
        [BUY_CURRENCY_CZK]: `${price} Kč`,
        [BUY_CURRENCY_BRL]: `R$${price}`,
        [BUY_CURRENCY_JPY]: `¥${normalizePrice(inputPrice)}`,
        [BUY_CURRENCY_KRW]: `₩${normalizePrice(inputPrice)}`,
    }
    return currencyPrefixMap[currency] || `${price} ${currency}`
}

export const getPriceWithoutCurrency = ({ price: inputPrice }: IGetPriceWithCurrencyProps) => {
    if (!inputPrice) return 0
    const parsedPrice = typeof inputPrice === 'string' ? parseFloat(inputPrice) : inputPrice
    const priceWith2Fixed = parsedPrice ? Number(parsedPrice.toFixed(2)) : inputPrice
    return parsedPrice % 1 ? priceWith2Fixed : inputPrice
}

type TCurrencyWithPrice = {
    price: number
    currency?: string
}

export const getCurrencyWithPrice = ({
    price,
    currency = BUY_CURRENCY_USD,
}: TCurrencyWithPrice) => {
    if (!price) return ''
    const pr = price.toFixed(2)
    const currencyPrefixMap = {
        [BUY_CURRENCY_USD]: `$${pr}`,
        [BUY_CURRENCY_EUR]: `${pr} €`,
        [BUY_CURRENCY_GBP]: `£${pr}`,
        [BUY_CURRENCY_CAD]: `C$${pr}`,
        [BUY_CURRENCY_AUD]: `A$${pr}`,
        [BUY_CURRENCY_NZD]: `$${pr}`,
        [BUY_CURRENCY_RUB]: `${pr} ₽`,
        [BUY_CURRENCY_MXN]: `Mex$${pr}`,
        [BUY_CURRENCY_PLN]: `${pr} zł`,
        [BUY_CURRENCY_CHF]: `${pr} Fr.`,
        [BUY_CURRENCY_CZK]: `${pr} Kč`,
        [BUY_CURRENCY_BRL]: `R$${pr}`,
    }
    return currencyPrefixMap[currency as keyof typeof currencyPrefixMap] || `${pr} ${currency}`
}
