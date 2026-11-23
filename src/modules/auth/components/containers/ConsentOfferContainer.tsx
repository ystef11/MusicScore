import { memo } from 'react'
import { View } from 'react-native'

import { BrandCheckboxWithTitle, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import { authStoreChunk } from '../../store/authStoreChunk.ts'

export const ConsentOfferContainer = memo(() => {
    const [isConsentOfferCheckbox] = useValues([authStoreChunk.props.getIsConsentOfferCheckbox])
    const actions = useActions({
        setIsConsentOfferCheckbox: authStoreChunk.actions.setIsConsentOfferCheckbox,
    })

    const onToggleConsentCheckbox = () => {
        actions.setIsConsentOfferCheckbox(!isConsentOfferCheckbox)
    }

    return (
        <View style={globalStyles.paddingBottom20}>
            <BrandCheckboxWithTitle
                font="f15w400"
                title={translate('native.screen_login.consent_offer_opt_out')}
                selected={isConsentOfferCheckbox}
                onToggle={onToggleConsentCheckbox}
            />
        </View>
    )
})
