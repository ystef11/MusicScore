import { useMemo } from 'react'

import { StackActions, useNavigation, useRoute } from '@react-navigation/native'

import { Screen } from '../constants/screens'

type ScreenName = (typeof Screen)[keyof typeof Screen]

export function useAppNavigation() {
    const navigation = useNavigation()

    return useMemo(
        () => ({
            navigate(screen: ScreenName, params?: any) {
                // @ts-ignore
                navigation.navigate(screen as never, params as never)
            },
            goBack: navigation.goBack,
            getState: navigation.getState,
            push(screen: ScreenName, params?: any) {
                navigation.dispatch(StackActions.push(screen, params))
            },
            pop(numberScreen: number) {
                navigation.dispatch(StackActions.pop(numberScreen))
            },
            popToTop() {
                navigation.dispatch(StackActions.popToTop())
            },
            replace(screen: ScreenName, params?: any) {
                navigation.dispatch(StackActions.replace(screen, params))
            },
            setParams(params: any) {
                navigation.setParams(params)
            },
            setOptions(params: any) {
                navigation.setOptions(params)
            },
            reset(params: any) {
                navigation.reset(params)
            },
            addListener: navigation.addListener,
        }),
        [navigation],
    )
}

export type AppNavigationType = ReturnType<typeof useAppNavigation>

export function useAppRoute<Params>() {
    const { params = {} } = useRoute<any>()
    return params as Params
}
