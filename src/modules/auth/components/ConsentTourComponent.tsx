import { memo } from 'react'
import { View } from 'react-native'

import { AppText, globalStyles, replacerText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { ConsentOfferContainer } from './containers/ConsentOfferContainer.tsx'
import LinkText from './LinkText'

export const ConsentTourComponent = memo(() => (
    <View style={globalStyles.paddingTop20}>
        <AppText
            adaptiveSize
            brandColor="contentSecondary"
            font="f15w400"
            rawText={replacerText({
                text: translate('native.create_account.privacy'),
                LinkComponent: LinkText,
            })}
            style={globalStyles.mb24}
        />
        <ConsentOfferContainer />
    </View>
))
