import { apiRequest, ebookContracts } from '@mu-native/api'

export const ebookContentService = ({ id, isFullAccess }: { id: string; isFullAccess: boolean }) =>
    apiRequest(isFullAccess ? ebookContracts.fullUrl : ebookContracts.previewUrl, {
        params: { ebook_id: id },
    })
