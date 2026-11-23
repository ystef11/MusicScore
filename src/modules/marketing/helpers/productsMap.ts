import type { Product } from 'react-native-iap'

import { platform } from '@mu-native/common'
import { translate } from '@mu-native/locale'

import { marketingConstants } from '../constants/marketingConstants'

import { getPriceWithCurrency } from './price'

const getCreditPackSummary = ({
    count,
    months,
    price,
    savePercent,
}: {
    count: number
    months: number
    price: string
    savePercent?: number
}) => {
    const creditsLine = translate('native.marketing.credit_pack.credits_valid_for', {
        count,
        months,
    })
    const priceLine = savePercent
        ? translate('native.marketing.credit_pack.price_one_time_save', {
              price,
              percent: String(savePercent),
          })
        : translate('native.marketing.credit_pack.price_one_time', { price })

    return `${creditsLine}\n${priceLine}`
}

const getCreditPackName = (count: number, savePercent?: number) =>
    savePercent
        ? translate('native.marketing.credit_pack.name_save_percent', {
              count,
              percent: String(savePercent),
          })
        : translate('native.marketing.credits_count', { count })

export const productsMap = (product: Product) => {
    const { price: currentPrice, id: productId = '', currency: currentCurrency } = product
    const oneTimePurchaseOfferDetailsAndroid =
        'discountOffers' in product
            ? product.discountOffers || [
                  {
                      currency: '',
                      price: 0,
                  },
              ]
            : [{ currency: '', price: 0 }]
    const currentAndroidProductData = oneTimePurchaseOfferDetailsAndroid[0]

    const currency = platform.isIos ? currentCurrency : currentAndroidProductData?.currency
    const price = platform.isIos
        ? +(currentPrice ?? 0).toFixed(2)
        : +currentAndroidProductData.price.toFixed(2)

    const priceWithCurrency = getPriceWithCurrency({ price, currency })
    const oneTimePayment = translate('native.marketing.price_line.one_time_payment', {
        price: priceWithCurrency,
    })
    const pdfSummary = `${translate('native.scores.includes_pdf_title')}\n${oneTimePayment}`

    const summary =
        {
            [marketingConstants.credit2pack]: getCreditPackSummary({
                count: 2,
                months: 2,
                price: priceWithCurrency,
            }),
            [marketingConstants.credit3pack]: getCreditPackSummary({
                count: 3,
                months: 2,
                price: priceWithCurrency,
                savePercent: 12,
            }),
            [marketingConstants.credit5pack]: getCreditPackSummary({
                count: 5,
                months: 3,
                price: priceWithCurrency,
                savePercent: 25,
            }),
            [marketingConstants.credit10pack]: getCreditPackSummary({
                count: 10,
                months: 6,
                price: priceWithCurrency,
                savePercent: 30,
            }),
            [marketingConstants.credit25pack]: getCreditPackSummary({
                count: 25,
                months: 12,
                price: priceWithCurrency,
                savePercent: 35,
            }),
            [marketingConstants.inAppScore59]: pdfSummary,
            [marketingConstants.inAppScore39]: pdfSummary,
            [marketingConstants.inAppScore79]: pdfSummary,
            [marketingConstants.inAppScore99]: pdfSummary,
            [marketingConstants.inAppScore119]: pdfSummary,
            [marketingConstants.inAppScore139]: pdfSummary,
            [marketingConstants.inAppScore36]: pdfSummary,
            [marketingConstants.inAppScore48]: pdfSummary,
            [marketingConstants.inAppScore719]: pdfSummary,
            [marketingConstants.inAppScore839]: pdfSummary,
            [marketingConstants.inAppBook20Cost]: oneTimePayment,
            [marketingConstants.inAppBook35Cost]: oneTimePayment,
            [marketingConstants.inAppBook55Cost]: oneTimePayment,
        }[productId] || ''

    const planName =
        {
            [marketingConstants.credit2pack]: getCreditPackName(2),
            [marketingConstants.credit3pack]: getCreditPackName(3, 12),
            [marketingConstants.credit5pack]: getCreditPackName(5, 25),
            [marketingConstants.credit10pack]: getCreditPackName(10, 30),
            [marketingConstants.credit25pack]: getCreditPackName(25, 35),
        }[productId] || translate('native.accessToScore')

    const badgeText =
        {
            [marketingConstants.inAppScore59]: translate('native.marketing.limited_offer'),
            [marketingConstants.inAppScore79]: translate('native.marketing.limited_offer'),
            [marketingConstants.credit5pack]: platform.isIos
                ? translate('native.marketing.most_popular')
                : translate('native.marketing.best_value'),
        }[productId] || ''

    const creditPackName =
        {
            [marketingConstants.credit2pack]: 'packet_1',
            [marketingConstants.credit3pack]: 'packet_2',
            [marketingConstants.credit5pack]: 'packet_3',
            [marketingConstants.credit10pack]: 'packet_4',
            [marketingConstants.credit25pack]: 'packet_5',
        }[productId] || ''

    return {
        ...product,
        productId: product.id,
        summary,
        planName,
        badgeText,
        creditPackName,
        price,
        priceWithCurrency,
    }
}
