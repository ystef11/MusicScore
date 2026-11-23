import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { LaunchArguments } from 'react-native-launch-arguments'

import { brandColors } from '@mu-native/ds'
import { marketingConstants, marketingStorage, marketingStoreChunk } from '@mu-native/marketing'
import { Screen, useNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.splash,
        width: '100%',
    },
})

const isSkipTourForAutoTests = LaunchArguments.value<{ skipTour: boolean }>()?.skipTour

export const StartScreen = () => {
    const [tourUpdateId, startMode] = useValues([
        marketingStoreChunk.props.getTourUpdateId,
        marketingStoreChunk.props.getStartMode,
    ])
    const navigation = useNavigation()

    const getNavigator = () => Screen.app

    useEffect(() => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    name: getNavigator() as any,
                },
            ],
        })
    }, [])

    return <View style={styles.container} />
}
