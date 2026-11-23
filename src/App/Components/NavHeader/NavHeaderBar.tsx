import React, { useCallback } from 'react'
import { StatusBar } from 'react-native'

import { setTestIds } from '@mu/mu-mobile-test-id'
import { AppNavigationHeaderView, brandColors, NavigationIconButton } from '@mu-native/ds'
import { detail } from '@mu-native/icons/detail'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'

import MetricaEvents from '../../constants/MetricaEvents'
import TooltipWrapper from '../../Elements/TooltipWrapper'
import reportEvent from '../../Utils/Analytics'
import FileManagerButton from '../FileManagerButton/FileManagerButton'

import { ProfileButton } from './components/ProfileButton.tsx'
import ResetButton from './components/ResetButton'
import { NotificationButton } from './NotificationButton'

type TProps = {
    testID?: string
    tab: boolean
    goBack: () => void
    headerTitle?: string
    isSongBook?: boolean
    hasMoreIcon?: boolean
    noNotifications?: boolean
    showProfile?: boolean
    showMorePopup?: () => void
    onResetPress?: () => void
    onCreateNewSetPress?: () => void
    endComponents?: React.ReactNode[]
}

export const NavHeaderBar = ({
    tab,
    goBack,
    headerTitle,
    isSongBook,
    hasMoreIcon,
    showMorePopup,
    noNotifications,
    showProfile,
    onResetPress,
    onCreateNewSetPress,
    endComponents,
    testID,
}: TProps) => {
    const rightBlock = useCallback(() => {
        return (
            <>
                {isSongBook && (
                    <TooltipWrapper text={translate('native.tooltips.upload')}>
                        {/* @ts-ignore-next-line */}
                        <FileManagerButton />
                    </TooltipWrapper>
                )}
                {!!onCreateNewSetPress && (
                    <NavigationIconButton
                        icon={plus}
                        onPress={onCreateNewSetPress}
                        testID={setTestIds.actions.createNewSetHeaderButton}
                    />
                )}
                {!!onResetPress && <ResetButton onResetPress={onResetPress} />}
                {hasMoreIcon && (
                    <TooltipWrapper text={translate('native.tooltips.more')}>
                        <NavigationIconButton
                            icon={detail}
                            onPress={showMorePopup}
                            color={brandColors.contentPrimary}
                        />
                    </TooltipWrapper>
                )}
                {showProfile && <ProfileButton />}
                {!noNotifications && !onResetPress && <NotificationButton />}
                {endComponents}
            </>
        )
    }, [
        isSongBook,
        onCreateNewSetPress,
        onResetPress,
        hasMoreIcon,
        showMorePopup,
        noNotifications,
        showProfile,
        endComponents,
    ])

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <AppNavigationHeaderView
                testID={testID}
                showAppLogo={tab}
                onLogoPress={() => reportEvent(MetricaEvents.HEADER_LOGO_CLICK)}
                goBack={tab ? undefined : goBack}
                title={headerTitle}
                rightBlock={rightBlock}
            />
        </>
    )
}
