import { ScreenTourUpdate } from './containers/ScreenTourUpdate'
import { useLoadTourUpdateScreenStore } from './store/useLoadTourUpdateScreenStore'

export const TourUpdateScreen = () => {
    useLoadTourUpdateScreenStore()

    return <ScreenTourUpdate />
}
