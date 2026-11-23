import { memo, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { AppText, layout } from '@mu-native/ds'
import { localizeEnsemble, translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../App/constants/scoreAnalytic'
import { getLicenseTitle, getPrivacyTitle } from '../../../../../../App/Model/MSScore'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../hooks/useCurrentScore'

type TNameValue = {
    name: string
    value: string
}

const NewMetaItem = ({ name, value }: TNameValue) => {
    return (
        <View style={styles.meta}>
            <AppText
                font="f15w400"
                brandColor="contentSecondary"
                style={styles.metaNameText}
                rawText={translate('native.common.label_with_colon', { label: name })}
            />
            <AppText font="f15w400" style={styles.metaValueText} rawText={value} />
        </View>
    )
}

export const DescriptionModalMetaInfo = memo(() => {
    const score = useCurrentScore()
    const navigation = useAppNavigation()
    const [currentUser] = useValues([authStoreChunk.props.getUser])

    const isOwnScore = score?.authorId?.toString() === currentUser?.id?.toString()

    const onUpdateVisibility = useCallback(() => {
        if (score) {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_CLICK, {
                ...getScoreMetaEvent(score),
                'params.key': ['placement'],
                'params.str_value': ['description_modal'],
                'params.value': [0],
            })
            navigation.push(Screen.makePublic, {
                score,
                preserveMetadata: true,
                placement: 'description_modal',
            })
        }
    }, [navigation, score])

    const meta = useMemo(
        () => [
            {
                name: translate('native.score_action_sheet.pages'),
                value: String(score?.pagesCount),
            },
            {
                name: translate('native.score_action_sheet.duration'),
                value: score?.duration,
            },
            {
                name: translate('native.score_action_sheet.measures'),
                value: String(score?.measures),
            },
            {
                name: translate('native.score_action_sheet.key_signature'),
                value: score?.keysig,
            },
            {
                name: translate('native.score_action_sheet.ensemble'),
                value: score?.instrumentations?.map(localizeEnsemble).join(', '),
            },
            {
                name: translate('native.score_action_sheet.part_count'),
                value: String(score?.partsCount),
            },
            {
                name: translate('native.score_action_sheet.part_names'),
                value: score?.instruments?.map(({ name }) => name).join(', '),
            },
            {
                name: translate('native.score_action_sheet.genre'),
                value: score?.genres?.length
                    ? score.genres
                          ?.map(({ name }) => `${name[0].toUpperCase()}${name.slice(1)}`)
                          .join(', ')
                    : '-',
            },
        ],
        [score],
    )

    const privacyValue = score?.privacy !== undefined ? getPrivacyTitle(score.privacy) : '-'
    const licenseValue = score?.license !== undefined ? getLicenseTitle(score.license) : '-'

    return (
        <View style={styles.base}>
            {meta.map(item => (
                <NewMetaItem key={item.name} name={item.name} value={item.value ?? '-'} />
            ))}
            <View style={styles.meta}>
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    style={styles.metaNameText}
                    rawText={translate('native.common.label_with_colon', {
                        label: translate('native.score_action_sheet.privacy'),
                    })}
                />
                <View style={styles.metaValueText}>
                    <AppText font="f15w400" rawText={privacyValue} />
                    {isOwnScore && (
                        <Pressable onPress={onUpdateVisibility}>
                            <AppText
                                font="f15w400"
                                brandColor="contentPrimary"
                                rawText={translate('native.make_public.update_visibility')}
                                style={styles.updateVisibilityText}
                            />
                        </Pressable>
                    )}
                </View>
            </View>
            <NewMetaItem
                name={translate('native.score_action_sheet.license')}
                value={licenseValue}
            />
        </View>
    )
})
DescriptionModalMetaInfo.displayName = 'DescriptionModalMetaInfo'

const styles = StyleSheet.create({
    base: {
        gap: 8,
    },

    meta: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },

    metaValueText: {
        paddingLeft: layout.marginSm,
        flex: 4.5,
    },

    metaNameText: {
        flex: 2.5,
    },

    updateVisibilityText: {
        textDecorationLine: 'underline',
    },
})
