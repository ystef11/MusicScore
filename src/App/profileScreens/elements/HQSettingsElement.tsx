import { Platform, View } from 'react-native'

import { profileTestIds } from '@mu/mu-mobile-test-id'
import { BrandSwitcherListCell } from '@mu-native/ds'
import { hqSoundfontStoreChunk, hqSoundfontThunkActions } from '@mu-native/hq-soundfont'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

const HQSettingsElement = () => {
    const actions = useActions({
        toggle: hqSoundfontThunkActions.toggleHQSoundfontEnabled,
    })

    const [isEnabled, isPro] = useValues([
        hqSoundfontStoreChunk.props.getIsEnabled,
        marketingStoreChunk.props.getIsPro,
    ])

    if (Platform.OS !== 'android' && !isPro) return null

    return (
        <View>
            <BrandSwitcherListCell
                title={translate('native.score_details_sheet.sound')}
                subtitle={translate('native.score_details_sheet.sound.description')}
                switchValue={isEnabled}
                onSwitchChange={() => actions.toggle()}
                testID={profileTestIds.settingsScreen.hqSoundSwitch}
            />
        </View>
    )
}

export default HQSettingsElement
