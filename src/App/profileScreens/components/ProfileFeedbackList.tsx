import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Linking, Text } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { colors, ListItem, IconForwardElement } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    marketingConstants,
    marketingStoreChunk,
    CreditBalanceItemComponent,
    getIsShowPricingPage,
} from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useValues, useActions } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import { showHelpCenter, showConversations, resetIdentity } from '../../Controllers/CustomerSupport'
import reportEvent from '../../Utils/Analytics'
import { RestoreScoreSettingsItem } from '../elements/RestoreScoreSettingsItem'

import ProfileHelpModal from './ProfileHelpModal'
import ProfileSettingsListItem from './ProfileSettingsListItem'

const PRIVACY_URL = 'https://musescore.com/legal/privacy'
const ACCESSIBILITY_URL = 'https://musescore.com/accessibility-statement'
const TOS_URL = 'https://musescore.com/legal/terms'

const styles = StyleSheet.create({
    block: {
        width: '100%',
        alignSelf: 'center',
    },
    container: {
        backgroundColor: colors.white,
        marginTop: 17,
    },
    containerTitle: {
        color: colors.text900,
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600',
        marginBottom: 16,
    },
})

async function openLink(link: string) {
    const canOpenLink = await Linking.canOpenURL(link)

    if (canOpenLink) {
        await Linking.openURL(link)
    }
}

const openTOS = () => {
    openLink(TOS_URL)
    reportEvent(MetricaEvents.SUPPORT_TERMS_OF_SERVICE)
}

const openPrivacy = () => {
    openLink(PRIVACY_URL)
    reportEvent(MetricaEvents.SUPPORT_PRIVACY_POLICY)
}

const openAccessibility = () => {
    openLink(ACCESSIBILITY_URL)
    reportEvent(MetricaEvents.SUPPORT_ACCESSIBILITY_POLICY)
}

const ProfileFeedbackList = () => {
    const [user, isShowPricingPage] = useValues([
        authStoreChunk.props.getUser,
        getIsShowPricingPage,
    ])

    const actions = useActions({
        setSource: marketingStoreChunk.actions.setSource,
    })
    const [helpModalVisible, setHelpModalVisible] = useState(false)
    const [emailRequired, setEmailRequired] = useState(false)
    const [openingChat, setOpeningChat] = useState<'questions' | 'conversation' | undefined>()
    const requestedType = useRef<'questions' | 'conversation' | undefined>(undefined)

    const [email, setEmail] = useState(user?.email)

    console.log({ user, email })

    useEffect(() => {
        setEmail(user?.email)
    }, [user])

    const setTempEmail = async (email: string) => {
        setEmail(email)
        await resetIdentity()
    }

    const onClose = () => {
        setEmailRequired(false)
        setHelpModalVisible(false)
        reportEvent(MetricaEvents.SUPPORT_MODAL_CLOSE)
    }

    const showEnterEmailIfNeed = () => {
        setEmailRequired(!email)
        setHelpModalVisible(!email)
        if (email) return false
        reportEvent(MetricaEvents.SUPPORT_MODAL_EMAIL)
        return true
    }

    const onContactUsPress = async () => {
        if (openingChat) return
        requestedType.current = 'conversation'
        if (showEnterEmailIfNeed()) return
        setOpeningChat('conversation')
        await showConversations()
        setOpeningChat(undefined)
        reportEvent(MetricaEvents.SUPPORT_OPEN_CONVERSATIONS)
    }

    const onQuestionsAndAnswersPress = async () => {
        if (openingChat) return
        requestedType.current = 'questions'
        setOpeningChat('questions')
        await showHelpCenter()
        setOpeningChat(undefined)
        reportEvent(MetricaEvents.SUPPORT_OPEN_HELPCENTER)
    }

    const onSubmit = async (email: string) => {
        setEmailRequired(false)
        setHelpModalVisible(false)
        if (!email) return
        await setTempEmail(email)
        if (requestedType.current === 'questions') {
            setTimeout(onQuestionsAndAnswersPress, 500)
        } else if (requestedType.current === 'conversation') {
            setTimeout(onContactUsPress, 500)
        }
        requestedType.current = undefined
    }

    const openPricingScreen = useCallback(() => {
        actions.setSource(marketingConstants.sources.allPage)
        NavigationService.navigate(Screen.pricingLandingScreen)
    }, [])

    const onPressBalanceItem = useCallback(() => {
        actions.setSource(marketingConstants.sources.pieceSaleProfileBalance)
    }, [])

    return (
        <View style={styles.block}>
            <View style={styles.container}>
                <ProfileSettingsListItem
                    isLoading={openingChat === 'questions'}
                    title={translate('native.profile.question_answers_title')}
                    onPress={onQuestionsAndAnswersPress}
                >
                    <IconForwardElement />
                </ProfileSettingsListItem>
                <ProfileSettingsListItem
                    isLoading={openingChat === 'conversation'}
                    title={translate('native.score_action_sheet.score_unavailable_contact')}
                    onPress={onContactUsPress}
                >
                    <IconForwardElement />
                </ProfileSettingsListItem>
                <Text style={styles.containerTitle}>
                    {translate('native.my_profile.more_section')}
                </Text>
                <RestoreScoreSettingsItem />
                <CreditBalanceItemComponent onPress={onPressBalanceItem} />
                {isShowPricingPage && (
                    <ListItem
                        title={translate('native.my_profile.pricing_title')}
                        subTitle={translate('native.my_profile.pricing_sub_title')}
                        isShowArrow
                        onPress={openPricingScreen}
                    />
                )}
                <ListItem
                    title={translate('native.terms_of_service')}
                    count={0}
                    onPress={openTOS}
                />
                <ListItem
                    title={translate('native.my_profile.pp_title')}
                    count={0}
                    onPress={openPrivacy}
                />
                <ListItem
                    title={translate('native.accessibility_statement')}
                    count={0}
                    onPress={openAccessibility}
                />
            </View>

            <ProfileHelpModal
                isVisible={helpModalVisible}
                emailRequired={emailRequired}
                showHelpCenter={onQuestionsAndAnswersPress}
                showConversations={onContactUsPress}
                onSubmit={onSubmit}
                onClose={onClose}
            />
        </View>
    )
}

export default memo(ProfileFeedbackList)
