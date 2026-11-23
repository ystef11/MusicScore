import { memo, useCallback } from 'react'
import { Text, View } from 'react-native'

import { MuseButton } from '@mu-native/ds'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { systemStoreChunk } from '@mu-native/system'
import { useValues } from '@ug/store'

import { styles } from '../styles'

export const EmptyList = memo(() => {
    const { navigate } = useAppNavigation()
    const [network, isPro] = useValues([
        systemStoreChunk.props.getNetwork,
        marketingStoreChunk.props.getIsPro,
    ])
    const isOffline = network?.isConnected === false
    const onPress = useCallback(() => navigate(Screen.songBook), [navigate])

    return (
        <View style={styles.emptyContainer}>
            {isOffline ? (
                <>
                    <Text style={styles.title}>{translate('native.search.empty_offline')}</Text>
                    {!!isPro && (
                        <MuseButton
                            title={translate('native.search.upload_now')}
                            startIcon={plus}
                            style={styles.uploadNowButton}
                            onPress={onPress}
                        />
                    )}
                </>
            ) : (
                <Text style={styles.title}>{translate('native.search.empty')}</Text>
            )}
        </View>
    )
})
