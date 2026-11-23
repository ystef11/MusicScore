import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TOmrConvertStatusDto,
    TOmrPdfUploadFields,
    TOmrPhotoUploadFields,
    TOmrUploadDto,
} from '../dto/omrDto'

import { defineContract } from './defineContract'

export const omrContracts = {
    /** Photos, optionally with PDFs, on the v1.5 endpoint. */
    uploadPhotos: defineContract.upload<TOmrUploadDto, TOmrPhotoUploadFields>(
        apiEndpoints.uploadOmrFile,
        { version: '1.5' },
    ),
    /** PDF-only upload on the unversioned endpoint. */
    uploadPdf: defineContract.upload<TOmrUploadDto, TOmrPdfUploadFields>(
        apiEndpoints.uploadOmrPdfFile,
        { version: null },
    ),
    convertStatus: defineContract.get<TOmrConvertStatusDto, { id: number }>(
        apiEndpoints.uploadOmrFile,
        { version: null },
    ),
    /** Remaining uploads the user may start; 0 disables the sheet. */
    uploadsLeft: defineContract.options<number>(apiEndpoints.uploadOmrFile, { version: '1.5' }),
}
