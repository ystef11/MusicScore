import React, { memo } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, style } from '@mu-native/ds'
import ExperimentsListItem from '../elements/ExperimentsListItem'
import type { TExperiment } from '../types/abTypes'

const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        backgroundColor: colors.white,
    }),
    resetButton: style.view({
        width: '100%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    }),
    resetButtonText: style.text({
        fontSize: 16,
        color: colors.red700,
    }),
})

type TProps = {
    experiments: TExperiment[]
    onOpenModal(index: number): void
    onResetExperiants(): void
    onResetAllVariations(): void
}

const ABScreenCompnent = ({
    experiments,
    onOpenModal,
    onResetExperiants,
    onResetAllVariations,
}: TProps) => (
    <View style={styles.container}>
        <TouchableOpacity style={styles.resetButton} onPress={onResetAllVariations}>
            <Text style={styles.resetButtonText}>Reset all to variation 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={onResetExperiants}>
            <Text style={styles.resetButtonText}>Reset experiments</Text>
        </TouchableOpacity>
        <FlatList
            data={experiments}
            extraData={experiments}
            keyExtractor={item => `${item.id}`}
            renderItem={({ item, index }) => (
                <ExperimentsListItem item={item} index={index} onPress={onOpenModal} />
            )}
        />
    </View>
)

export default memo(ABScreenCompnent)
