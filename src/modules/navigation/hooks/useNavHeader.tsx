import { useLayoutEffect } from 'react'

import { NavHeader } from '../../../App/Components/NavHeader/NavHeader.tsx'

import { useAppNavigation } from './useAppNavigation.tsx'

export function useNavHeader(title?: string, tab?: boolean, testID?: string, isShow = true) {
    const navigation = useAppNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: isShow,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader testID={testID} headerTitle={title} noNotifications={!tab} tab={tab} />
            ),
        })
    }, [title, isShow, navigation, tab, testID])
}
