import { translate } from '@mu-native/locale'
import { keepLocalCopy, pick, types } from '@react-native-documents/picker'

type PickedPdf = { uri: string; size: number | null }

type PickPdfFilesResult = { ok: true; files: PickedPdf[] } | { ok: false; error: string }

export const MAX_OMR_FILES = 15
export const MAX_OMR_TOTAL_SIZE = 75 * 1024 * 1024
export const MAX_OMR_PFG_TOTAL_SIZE = 50 * 1024 * 1024

// Picker URIs point at the file's provider location and are percent-encoded. Names with
// spaces (or other special chars) become e.g. `My%20Score.pdf`, which react-native-fs and
// the upload layer fail to resolve ("no such file"). Copy to a sanitized local filename.
const sanitizeFileName = (name: string | undefined, index: number): string => {
    const cleaned = name?.replace(/[^\w.-]+/g, '_')
    return cleaned && /\.\w+$/.test(cleaned) ? cleaned : `omr_${index}.pdf`
}

export const pickPdfFiles = async (): Promise<PickPdfFilesResult> => {
    const result = await pick({
        type: [types.pdf],
        allowMultiSelection: true,
    })

    if (result.length === 0) {
        return { ok: false, error: translate('native.screen_omr.error_selecting_pdf') }
    }

    if (result.length > MAX_OMR_FILES) {
        return {
            ok: false,
            error: translate('native.screen_omr.error_max_files_allowed', {
                count: String(MAX_OMR_FILES),
            }),
        }
    }

    const totalSize = result.reduce((sum, doc) => sum + (doc.size ?? 0), 0)
    if (totalSize > MAX_OMR_TOTAL_SIZE) {
        return {
            ok: false,
            error: translate('native.screen_omr.error_total_size_exceeds_75mb'),
        }
    }

    const localFiles = await keepLocalCopy({
        files: result.map((doc, i) => ({
            uri: doc.uri,
            fileName: sanitizeFileName(doc.name ?? undefined, i),
        })) as [{ uri: string; fileName: string }, ...{ uri: string; fileName: string }[]],
        destination: 'cachesDirectory',
    })

    const files: PickedPdf[] = []

    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < result.length; i++) {
        const document = result[i]
        // const check = checkFileSizeHelper(document.size)
        // if (!check.isAvailableForUpload) {
        //     return {
        //         ok: false,
        //         error: `Selected file is ${check.fileSizeFormated} size. Please select less 20mb`,
        //     }
        // }

        const localFile = localFiles?.[i]
        const uri = localFile?.status === 'success' ? localFile.localUri : document.uri
        files.push({ uri, size: document.size })
    }

    return { ok: true, files }
}
