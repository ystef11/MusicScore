import { useEffect } from 'react'

import { NavigationService } from '@mu-native/navigation'
import { useActions } from '@ug/store'

import { NPS_SHOW_DELAY_MS } from '../constants/npsConstants'
import { isNpsScoreScreen } from '../helpers/npsEligibility'
import { getNpsTriggerAction, getTopRouteName } from '../helpers/npsNavigation'
import { tryShowNpsThunk } from '../store/npsThunks'

export const NpsTriggerContainer = () => {
    const actions = useActions({ tryShow: tryShowNpsThunk })

    useEffect(() => {
        let wasOnScore = isNpsScoreScreen(getTopRouteName())
        let timer: ReturnType<typeof setTimeout> | undefined

        const clearTimer = () => {
            if (timer) clearTimeout(timer)
            timer = undefined
        }

        const unsubscribe = NavigationService.addStateListener(() => {
            const routeName = getTopRouteName()
            const action = getNpsTriggerAction(wasOnScore, routeName)

            if (action !== 'none') clearTimer()
            if (action === 'arm') {
                timer = setTimeout(() => {
                    timer = undefined
                    actions.tryShow()
                }, NPS_SHOW_DELAY_MS)
            }
            if (routeName !== null) wasOnScore = isNpsScoreScreen(routeName)
        })

        return () => {
            clearTimer()
            unsubscribe()
        }
    }, [actions])

    return null
}
