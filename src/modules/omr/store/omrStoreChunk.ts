import { createExtendedStoreChunk } from '@ug/store'

import { OmrModalTypeEnum } from '../types/omrTypes.ts'

type TOmrStoreChunk = {
    isOpenOmrModal: boolean
    omrModalType: OmrModalTypeEnum
    cameraPosition: 'back' | 'front'
    photos: string[]
    pdfs: string[]
    currentPhoto: string
    isEditMode: boolean
    isLoading: boolean
    uploadProgress: number
    omrProcessScanningArraysIds: number[]
    isOpenAiScanModalComponent: boolean
}
const initialState: TOmrStoreChunk = {
    isOpenOmrModal: false,
    omrModalType: OmrModalTypeEnum.SelectFormat,
    cameraPosition: 'back',
    photos: [],
    pdfs: [],
    currentPhoto: '',
    isEditMode: false,
    isLoading: false,
    uploadProgress: 0,
    omrProcessScanningArraysIds: [],
    isOpenAiScanModalComponent: false,
}

export const omrStoreChunk = createExtendedStoreChunk<TOmrStoreChunk>({
    storeKey: 'omr',
    treeKey: 'modules',
})({
    initialState,
    persist: ['omrProcessScanningArraysIds'],
    actions: {
        switchCamera: (_, state) => ({
            cameraPosition: state.cameraPosition === 'back' ? 'front' : 'back',
        }),
        addPhoto: (photo: string, state) => ({
            photos: state.photos.includes(photo) ? state.photos : [...state.photos, photo],
            isEditMode: false,
        }),
        addPdf: (file: string, state) => ({
            pdfs: state.pdfs.includes(file) ? state.pdfs : [...state.pdfs, file],
            isEditMode: false,
        }),
        deleteLastPhoto: (_, state) => ({
            photos: state.isEditMode
                ? state.photos.filter((_, index) => index !== state.photos.length - 1)
                : state.photos,
            isEditMode: false,
        }),
        clearOnUnmount: (_, state) => ({
            isEditMode: false,
            currentPhoto: '',
            photos: [],
        }),
        addOmrIdsScanning: (id: number, state) => ({
            photos: [],
            pdfFilePath: '',
            omrProcessScanningArraysIds: [...state.omrProcessScanningArraysIds, id],
        }),
        removeOmrIdsScanning: (idRemove: number, state) => ({
            omrProcessScanningArraysIds: state.omrProcessScanningArraysIds.filter(
                id => id !== idRemove,
            ),
        }),
        addOrRemovePhoto: (path: string, state) => ({
            photos: state.photos.includes(path)
                ? state.photos.filter((photoPath, index) => path !== photoPath)
                : [...state.photos, path],
        }),
        removedPhoto: (photoForRemove: string, state) => ({
            photos: state.photos.filter(photo => photo !== photoForRemove),
        }),
        removedPdf: (file: string, state) => ({
            pdfs: state.pdfs.filter(photo => photo !== file),
        }),

        cleanup: () => {
            return {
                photos: [],
                pdfs: [],
            }
        },
    },
})
