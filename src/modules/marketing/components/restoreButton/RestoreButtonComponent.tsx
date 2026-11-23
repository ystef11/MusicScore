import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import {
    AppText,
    CommonTouchable,
    type BrandsThemeFontKey,
    type BrandThemeColorKey,
    BrandAppLoader,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import { billingThunks } from '../../store/billingThunks'
import { marketingStoreChunk } from '../../store/marketingStoreChunk'

type TRestoreButtonComponent = {
    color?: BrandThemeColorKey
    style?: StyleProp<ViewStyle>
    font?: BrandsThemeFontKey
}

export const RestoreButtonComponent = memo(
    ({ color = 'contentPrimary', style, font = 'f16w700' }: TRestoreButtonComponent) => {
        const [isRestoreProcessing] = useValues([marketingStoreChunk.props.getIsRestoreProcessing])
        const { restorePurchases } = useActions({
            restorePurchases: billingThunks.restorePurchases,
        })

        if (isRestoreProcessing) {
            return <BrandAppLoader size="s" />
        }

        const onPress = () => {
            restorePurchases({})
        }

        return (
            <CommonTouchable onPress={onPress} style={style}>
                <AppText
                    font={font}
                    adaptiveSize
                    brandColor={color}
                    rawText={translate('native.billing_restore')}
                />
            </CommonTouchable>
        )
    },
)
