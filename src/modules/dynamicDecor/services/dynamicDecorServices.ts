import { apiRequest, marketingContracts } from '@mu-native/api'

const getPromotionalPeriods = () => apiRequest(marketingContracts.special)

const getActiveDecorAssets = ({ id }: { id: number }) =>
    apiRequest(marketingContracts.saleOffer, { params: { id } })

export const dynamicDecorServices = {
    getPromotionalPeriods,
    getActiveDecorAssets,
}
