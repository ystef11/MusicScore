import { ScrollView, StyleSheet } from 'react-native'

import {
    AppText,
    globalStyles,
    layout,
    layoutHelpers,
    OnboardingTitleComponent,
    RootViewScreenComponent,
    RootViewTabletLayoutComponent,
} from '@mu-native/ds'
import { giftChecklistStoreChunk } from '@mu-native/gift-checklist'
import { translate } from '@mu-native/locale'
import { BackButton } from '@mu-native/marketing'
import { useValues } from '@ug/store'

import { CompleteModalContainer } from './components/CompleteModal.tsx'
import { CheckActiveSubscriptionContainer } from './containers/CheckActiveSubscriptionContainer.tsx'
import { TasksContainer } from './containers/TaskContainer.tsx'

const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: 120,
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        paddingBottom: 40,
    },
})

export const CheckListContainer = () => {
    const [currentGiftId] = useValues([giftChecklistStoreChunk.props.getCurrentGiftId])

    return (
        <RootViewScreenComponent>
            <RootViewTabletLayoutComponent>
                <BackButton isBackIcon isShowRestoreButton={false} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={globalStyles.flex1FullWidth}
                    contentContainerStyle={styles.mainContainer}
                >
                    <OnboardingTitleComponent
                        contentStyle={globalStyles.zeroHorizontalPadding}
                        title={translate('native.marketing.gift_daily_title')}
                        titleStyle={globalStyles.textAlignCenter}
                        subTitle={translate('native.marketing.gift_check_daily_title')}
                        subTitleStyle={globalStyles.textAlignCenter}
                    />
                    <TasksContainer currentGiftId={currentGiftId} />
                    <AppText
                        textAlign="center"
                        font="f14w400"
                        adaptiveSize
                        rawText={translate('native.marketing.gift_active_subscription')}
                    />
                </ScrollView>
            </RootViewTabletLayoutComponent>
            {!!currentGiftId && <CompleteModalContainer currentGiftId={currentGiftId} />}
            <CheckActiveSubscriptionContainer />
        </RootViewScreenComponent>
    )
}
