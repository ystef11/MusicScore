import { NavigationService, Screen } from '@mu-native/navigation'

import { ExperimentsMonetization } from '../../constants/experiments.ts'

export const openLearnTabAfterTourExp = {
    id: 8348,
    name: ExperimentsMonetization.openLearnTabAfterTour,
}

export const resetToLearnTab = () =>
    NavigationService.reset({
        index: 0,
        routes: [
            {
                name: Screen.app,
                params: {
                    screen: Screen.tabNavigator,
                    params: { screen: Screen.learn },
                },
            },
        ],
    })
