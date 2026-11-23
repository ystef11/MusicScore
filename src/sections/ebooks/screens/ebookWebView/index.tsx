import { EbookWebViewContainer } from './containers/EbookWebViewContainer'
import useLoadCurrentEbookScreenStore from './store/useLoadEbookWebViewStore'

export const EbookWebViewScreen = () => {
    useLoadCurrentEbookScreenStore()

    return <EbookWebViewContainer />
}
