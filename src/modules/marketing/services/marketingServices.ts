import {
    apiRequest,
    courseContracts,
    ebookContracts,
    purchaseContracts,
    statisticContracts,
    userContracts,
    type TAndroidInstallPayloadDto,
    type TAndroidReceiptPayloadDto,
    type TIosInstallPayloadDto,
    type TIosReceiptPayloadDto,
    type TPurchaseContentStoragePayloadDto,
} from '@mu-native/api'
import { device } from '@mu-native/common'

const deviceParams = () => ({ device_id: device.uniqueId })

const clientTimeHeaders = () => [
    { title: 'x-mu-client-time', get: () => String(Math.round(Date.now())) },
    {
        title: 'x-mu-client-time-offset',
        get: () => String(new Date().getTimezoneOffset() * 60),
    },
]

// Analytics tracker registration is removed.
export const paymentAccountIdService = async () => undefined

export const purchaseTokenAndroidService = () => apiRequest(purchaseContracts.androidPurchaseTokens)

export const registerSingleReceiptAndroidService = (bodyObject: TAndroidReceiptPayloadDto) =>
    apiRequest(purchaseContracts.registerAndroidReceipt, {
        params: deviceParams(),
        payload: bodyObject,
    })

export const registerSingleReceiptIosService = ({
    bodyObject,
}: {
    bodyObject: TIosReceiptPayloadDto
}) =>
    apiRequest(purchaseContracts.importIosReceipt, {
        params: deviceParams(),
        headerParams: clientTimeHeaders(),
        payload: bodyObject,
    })

export const registerInstallAndroidService = async (_bodyObject: TAndroidInstallPayloadDto) => {}
export const registerInstallIOSService = async (_bodyObject: TIosInstallPayloadDto) => {}

export const accessRightsService = () => apiRequest(purchaseContracts.serviceAccess)

export const dynamicContentFieldService = () => apiRequest(statisticContracts.summary)

export const userBalanceCreditService = (bodyObject: { user_id: number }) =>
    apiRequest(userContracts.balance, { params: bodyObject })

export const buyScoreByCredit = (bodyObject: { score_id: string | number }) =>
    apiRequest(purchaseContracts.buyScoreByCredit, { payload: bodyObject })

export const buyCourseByCredit = (payload: { course_id: string }) =>
    apiRequest(courseContracts.buyByCredit, { payload })

export const freeGiftCreditService = (type: number) =>
    apiRequest(purchaseContracts.bonusCredit, { params: { type } })

export const buyEbookByCredit = (payload: { ebook_id: string }) =>
    apiRequest(ebookContracts.buyByCredit, { payload })

export const saveInAppForSale = (bodyObject: TPurchaseContentStoragePayloadDto) =>
    apiRequest(purchaseContracts.setContentStorage, { payload: bodyObject })

export const getInAppForSale = () => apiRequest(purchaseContracts.getContentStorage)
