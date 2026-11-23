import { useNavigationState, useRoute } from '@react-navigation/native'

export const useSameRouteInStackCount = () => {
    const { name: routeName } = useRoute()
    const sameRoutesInStack = useNavigationState(state =>
        state.routes.filter(r => r.name === routeName),
    )
    return sameRoutesInStack.length
}
