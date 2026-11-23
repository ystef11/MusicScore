import React, { memo } from 'react'

import { getIsAuthorized } from '@mu-native/auth'
import { NavigationService } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import ViewController from '../../Controllers/ViewController'

import { NavHeaderBar } from './NavHeaderBar'

type Props = {
    testID?: string
    tab?: boolean
    headerTitle?: string
    isProfile?: boolean
    isSongBook?: boolean
    noNotifications?: boolean
    showProfile?: boolean
    onResetPress?: () => void
    onCreateNewSetPress?: () => void
    endComponents?: React.ReactNode[]
}

export const NavHeader = memo((props: Props) => {
    const actions = useActions({ showMorePopup: ViewController.showProfileSettingsActionSheet })
    const [isAuth] = useValues([getIsAuthorized])

    return (
        <NavHeaderBar
            testID={props.testID}
            goBack={NavigationService.goBack}
            tab={props.tab === true}
            isSongBook={props.isSongBook}
            headerTitle={props.headerTitle}
            showMorePopup={actions.showMorePopup}
            hasMoreIcon={isAuth && props.isProfile}
            noNotifications={props.noNotifications}
            showProfile={props.showProfile}
            onResetPress={props.onResetPress}
            onCreateNewSetPress={props.onCreateNewSetPress}
            endComponents={props.endComponents}
        />
    )
})
