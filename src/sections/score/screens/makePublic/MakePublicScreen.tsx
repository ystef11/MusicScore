import { MakePublicContainer } from './containers/MakePublicContainer.tsx'
import useLoadMakePublicStore from './store/useLoadMakePublicStore.ts'

export const MakePublicScreen = () => {
    useLoadMakePublicStore()
    return <MakePublicContainer />
}
