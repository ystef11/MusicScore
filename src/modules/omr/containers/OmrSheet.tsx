import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useIsNewAppConcept } from '@mu-native/ab'
import { apiRequest, omrContracts } from '@mu-native/api'
import { layout, NativeBottomSheet, NativeBottomSheetRef, staticSafeArea } from '@mu-native/ds'
import { OmrModalTypeEnum, omrStoreChunk } from '@mu-native/omr'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../App/Utils/Analytics.ts'

import { OmrPhotoRulesComponent } from './components/OmrPhotoRulesComponent.tsx'
import { OmrAddScoreContainer } from './containers/OmrAddScoreContainer.tsx'
import { OmrSelectFormatContainer } from './containers/OmrSelectFormatContainer.tsx'

export const OmrSheet = React.memo(() => {
    const [canUpload, setCanUpload] = useState(false)
    const isNewAppConcept = useIsNewAppConcept()
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const actions = useActions({
        setIsOpenOmrModal: omrStoreChunk.actions.setIsOpenOmrModal,
        setOmrModalType: omrStoreChunk.actions.setOmrModalType,
    })
    const [isVisible, omrModalType] = useValues([
        omrStoreChunk.props.getIsOpenOmrModal,
        omrStoreChunk.props.getOmrModalType,
    ])

    const checkCanUpload = useCallback(async () => {
        try {
            const response = await apiRequest(omrContracts.uploadsLeft)
            setCanUpload(response > 0)
        } catch (e) {
            setCanUpload(false)
            console.log('[OmrSheet..error]', e)
        }
    }, [])

    const closeModal = () => {
        actions.setOmrModalType(OmrModalTypeEnum.SelectFormat)
        actions.setIsOpenOmrModal(false)
    }

    useEffect(() => {
        console.log('[OmrSheet.effect]')
        if (isVisible) {
            checkCanUpload()
            console.log('[OmrModalContainer.effect.render]')
            sheetRef.current?.present()
            reportEvent('Temp Upload Step Show', { value: 'upload_type' })
        }
    }, [checkCanUpload, isVisible])

    const _omrModalType = omrModalType
    // _omrModalType = OmrModalTypeEnum.OmrPhotoRules

    return (
        <NativeBottomSheet
            ref={sheetRef}
            onDismiss={closeModal}
            rootViewStyle={{
                paddingBottom: staticSafeArea().bottom,
                paddingHorizontal: layout.baseMarginFromEdges,
            }}
        >
            {_omrModalType === OmrModalTypeEnum.SelectFormat &&
                (isNewAppConcept ? (
                    <OmrAddScoreContainer canUpload={canUpload} />
                ) : (
                    <OmrSelectFormatContainer canUpload={canUpload} />
                ))}
            {_omrModalType === OmrModalTypeEnum.OmrPhotoRules && <OmrPhotoRulesComponent />}
        </NativeBottomSheet>
    )
})
