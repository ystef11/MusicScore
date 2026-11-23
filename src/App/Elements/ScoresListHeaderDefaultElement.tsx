import { StyleSheet, View } from 'react-native'

import { isTablet } from '../Utils/Platform'

const ScoresListHeaderDefaultElement = () => <View style={styles.view} />

const styles = StyleSheet.create({
    view: {
        height: isTablet ? 40 : 12,
        width: '100%',
    },
})

export default ScoresListHeaderDefaultElement
