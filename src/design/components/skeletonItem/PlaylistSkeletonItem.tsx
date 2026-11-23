import { StyleSheet, View } from 'react-native'

import { brandColors } from '../../constants/new/brandColors.ts'

type TProps = {
    size?: number
}

export const PlaylistSkeletonItem = ({ size = 160 }: TProps) => {
    return <View style={[styles.container, { width: size, height: size }]} />
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: brandColors.backgroundInactive,
    },
})
