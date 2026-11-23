import { useCallback } from 'react'
import { StyleSheet } from 'react-native'

import { BrandBaseListCell, brandColors, Icon, RootViewScreenComponent } from '@mu-native/ds'
import { checkmark } from '@mu-native/icons/checkmark'
import { useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import { type ScorePrivacyValue } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics'
import { getAccessOptions } from '../constants.ts'
import makePublicStoreChunk from '../store/makePublicStoreChunk.ts'

const Checkmark = <Icon source={checkmark} size={24} tint={brandColors.contentPrimary} />

export const ManageAccessScreen = () => {
    const navigation = useAppNavigation()
    const actions = useActions({ setAccess: makePublicStoreChunk.actions.setAccess })
    const [access] = useValues([makePublicStoreChunk.props.getAccess])

    const onSelect = useCallback(
        (key: ScorePrivacyValue) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_ACCESS_CHANGE, {
                'params.key': ['access'],
                'params.str_value': [''],
                'params.value': [key],
            })
            actions.setAccess(key)
            navigation.goBack()
        },
        [actions, navigation],
    )

    return (
        <RootViewScreenComponent>
            {getAccessOptions().map(option => (
                <BrandBaseListCell
                    key={option.key}
                    title={option.label}
                    rightComponent={access === option.key ? Checkmark : undefined}
                    onPress={() => onSelect(option.key)}
                    style={styles.item}
                />
            ))}
        </RootViewScreenComponent>
    )
}

const styles = StyleSheet.create({
    item: {
        alignSelf: 'stretch',
    },
})
