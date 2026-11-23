import { useCallback } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { BrandBaseListCell, brandColors, Icon, RootViewScreenComponent } from '@mu-native/ds'
import { checkmark } from '@mu-native/icons/checkmark'
import { useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics'
import { getCopyrightOptions, type CopyrightOption } from '../constants.ts'
import makePublicStoreChunk from '../store/makePublicStoreChunk.ts'

const Checkmark = <Icon source={checkmark} size={24} tint={brandColors.contentPrimary} />

export const CopyrightSettingsScreen = () => {
    const navigation = useAppNavigation()
    const actions = useActions({ setCopyright: makePublicStoreChunk.actions.setCopyright })
    const [copyright] = useValues([makePublicStoreChunk.props.getCopyright])

    const onSelect = useCallback(
        (key: CopyrightOption) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_COPYRIGHT_CHANGE, {
                'params.key': ['copyright'],
                'params.str_value': [key],
                'params.value': [0],
            })
            actions.setCopyright(key)
            navigation.goBack()
        },
        [actions, navigation],
    )

    return (
        <RootViewScreenComponent>
            <ScrollView style={styles.scroll}>
                {getCopyrightOptions().map(option => (
                    <BrandBaseListCell
                        key={option.key}
                        title={option.label}
                        rightComponent={copyright === option.key ? Checkmark : undefined}
                        onPress={() => onSelect(option.key)}
                    />
                ))}
            </ScrollView>
        </RootViewScreenComponent>
    )
}

const styles = StyleSheet.create({
    scroll: {
        alignSelf: 'stretch',
    },
})
