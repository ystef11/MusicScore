import { ScoreSaleContainer } from './containers/ScoreSaleContainer'
import { useLoadScoreSaleScreenStore } from './store/useLoadScoreSaleStore'

export const ScoreSaleScreen = () => {
    useLoadScoreSaleScreenStore()

    return <ScoreSaleContainer />
}
