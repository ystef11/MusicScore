import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, layoutHelpers, style } from '@mu-native/ds'
import type { TExperiment } from '../types/abTypes'

const styles = StyleSheet.create({
    container: style.view({
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: layoutHelpers.getResponsiveSizeExtended(12),
    }),
    separator: style.view({
        width: '100%',
        height: 1,
        backgroundColor: colors.blue800,
    }),
    text: style.text({
        fontSize: layoutHelpers.getResponsiveSizeExtended(15),
        textAlign: 'center',
        color: colors.blue800,
    }),
    bold: style.text({ fontWeight: 'bold' }),
})

type TProps = {
    item: TExperiment
    index: number
    onPress(index: number): void
}

const ExperimentsListItem = ({ item, index, onPress }: TProps) => {
    const handlePress = () => {
        onPress(index)
    }

    return (
        <>
            {!index ? <View style={styles.separator} /> : null}
            <TouchableOpacity style={styles.container} onPress={handlePress}>
                <Text style={styles.text}>{item.name}</Text>
                <Text style={[styles.text, styles.bold]}>Id: {item.id}</Text>
                <Text style={[styles.text, styles.bold]}>Variation: {item.variation}</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
        </>
    )
}

export default ExperimentsListItem
