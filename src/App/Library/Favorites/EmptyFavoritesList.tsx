import { View } from 'react-native'

import { globalStyles, BaseEmptyStateView } from '@mu-native/ds'
import { noteList } from '@mu-native/icons/noteList'
import { translate } from '@mu-native/locale'
import { systemStoreChunk } from '@mu-native/system'
import { useValues } from '@ug/store'

type TProps = {
    openExplore: () => void
}

export const EmptyFavoritesList = ({ openExplore }: TProps) => {
    const [network] = useValues([systemStoreChunk.props.getNetwork])
    const isOffline = network?.isConnected === false

    const description = isOffline
        ? translate('native.library.favorites.desc_offline')
        : translate('native.library.favorites.desc')

    return (
        <View style={globalStyles.flex1}>
            <BaseEmptyStateView
                title={translate('native.library.empty_favorites_title')}
                description={description}
                icon={noteList}
                primaryButton={{
                    title: translate('native.library.favorites.search_btn_title'),
                    onPress: openExplore,
                }}
            />
        </View>
    )
}
