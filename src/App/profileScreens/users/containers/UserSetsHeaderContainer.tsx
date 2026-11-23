import React, { useCallback } from 'react'

import { AppNavigationHeaderView } from '@mu-native/ds'
import { useNavigation } from '@mu-native/navigation'

type THeader = {
    testID?: string
    headerTitle: string
    rightComponent?: React.ReactNode
}

const UserSetsHeaderContainer = ({ testID, headerTitle = '', rightComponent }: THeader) => {
    const { goBack } = useNavigation()

    const rightBlock = useCallback(() => {
        return rightComponent
    }, [])

    return (
        <AppNavigationHeaderView
            testID={testID}
            title={headerTitle}
            goBack={goBack}
            rightBlock={rightBlock}
            titleNumberOfLines={1}
        />
    )
}

export default UserSetsHeaderContainer
