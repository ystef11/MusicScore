import { type ReactNode, useCallback } from 'react'

import { AppNavigationHeaderView } from '@mu-native/ds'
import { NavigationService } from '@mu-native/navigation'

type TProps = {
    title: string
    rightComponent?: ReactNode
    testID?: string
    children?: ReactNode
}

export const NestedScreenHeader = ({ title, rightComponent, testID, children }: TProps) => {
    const rightBlock = useCallback(() => rightComponent, [rightComponent])

    return (
        <AppNavigationHeaderView
            testID={testID}
            title={title}
            titleNumberOfLines={1}
            goBack={NavigationService.goBack}
            rightBlock={rightBlock}
            animatable={false}
        >
            {children}
        </AppNavigationHeaderView>
    )
}
