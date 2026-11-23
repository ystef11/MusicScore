import { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { getStoreValue } from '@mu-native/common'
import { AppText, brandColors, CommonTouchable, globalStyles, Icon, layout } from '@mu-native/ds'
import { chevronRight } from '@mu-native/icons/chevronRight'
import { hubsStoreChunk, hubsThunks } from '@mu-native/hubs'
import { translate } from '@mu-native/locale'
import { marketingConstants, TourSteps } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import { Switch } from '@mu-native/ds'
import reportEvent from '../../../Utils/Analytics'

type HubNewForYouCardProps = {
    tourInstrument: string | number | null
}

const MyPreferences = () => {
    const { navigate } = useAppNavigation()
    const [quizAnswersNames] = useValues([quizStoreChunk.props.getQuizAnswersNames])
    const quizAnswersStrings = useMemo(() => quizAnswersNames?.join(', '), [quizAnswersNames])

    const onPressPersonalized = () => {
        navigate(Screen.tourInstall, {
            screen: Screen.tourInstall,
            params: {
                step: TourSteps.UPDATE_QUIZ_STEP,
                routeName: Screen.hubMain,
                source: marketingConstants.sources.quizUpdateHub,
            },
        })
    }

    return (
        <CommonTouchable onPress={onPressPersonalized} style={styles.preferencesContainer}>
            <View style={globalStyles.flex1}>
                <AppText
                    style={styles.mainTitle}
                    font="f17w400"
                    brandColor="contentPrimary"
                    rawText={translate('native.preferences.main_title')}
                />
                <AppText
                    brandColor="contentSecondary"
                    font="f13w400"
                    rawText={quizAnswersStrings || translate('native.preferences.sub_title')}
                />
            </View>
            <Icon source={chevronRight} size={24} tint={brandColors.contentSecondary} />
        </CommonTouchable>
    )
}

const Reminder = () => {
    const [weeklyReminderEnabled] = useValues([hubsStoreChunk.props.getWeeklyReminderEnabled])
    const { toggleWeeklyReminder } = useActions({
        toggleWeeklyReminder: hubsThunks.toggleWeeklyReminder,
    })
    return (
        <View style={styles.subtitleContainer}>
            <View style={styles.titleSubtitle}>
                <AppText
                    font="f17w400"
                    brandColor="contentPrimary"
                    style={styles.reminderText}
                    rawText={translate('native.hub_new_for_you.remindersControl.title')}
                />
                <AppText
                    font="f13w400"
                    brandColor="contentSecondary"
                    rawText={translate('native.hub_new_for_you.description')}
                />
            </View>
            <Switch value={weeklyReminderEnabled} onValueChange={toggleWeeklyReminder} />
        </View>
    )
}

export const HubNewForYouCard = ({ tourInstrument }: HubNewForYouCardProps) => {
    useEffect(() => {
        reportEvent('Personal Hub: open', {
            tourInstrument,
            reminderState: getStoreValue(hubsStoreChunk.props.getWeeklyReminderEnabled),
        })
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.reminderContainer}>
                    <Reminder />
                </View>
            </View>
            <MyPreferences />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginBottom: 20,
    },
    titleSubtitle: {
        flex: 1,
        marginEnd: 56,
    },
    reminderText: {
        flex: 1,
        marginBottom: 4,
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    reminderContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 12,
    },
    preferencesContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingVertical: 12,
    },
    mainTitle: {
        marginBottom: 4,
        flex: 1,
    },
})
