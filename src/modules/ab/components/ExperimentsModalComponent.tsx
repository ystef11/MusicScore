import React, { Fragment, useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, style } from '@mu-native/ds'
import type { TExperiment } from '../types/abTypes'

const styles = StyleSheet.create({
    buttonContainer: style.view({
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    }),
    active: style.view({
        backgroundColor: colors.cyan,
    }),
    buttonText: style.text({
        fontSize: 16,
        color: colors.blue800,
    }),
    separator: style.view({
        width: '100%',
        height: 1,
        backgroundColor: colors.blue800,
    }),
})

type TProps = {
    experiment: TExperiment
    onSetVariation(variation: number): void
}

const ExperimentsModalComponent = ({ experiment, onSetVariation }: TProps) => {
    const buttons = useMemo(
        () =>
            Array.from(Array(experiment.variationsCount).keys())?.map(item => (
                <Fragment key={item}>
                    {item ? <View style={styles.separator} /> : null}
                    <TouchableOpacity
                        key={item}
                        style={StyleSheet.flatten([
                            styles.buttonContainer,
                            item + 1 === experiment.variation ? styles.active : {},
                        ])}
                        onPress={() => onSetVariation(item + 1)}
                    >
                        <Text style={styles.buttonText}>Variation: {item + 1}</Text>
                    </TouchableOpacity>
                </Fragment>
            )),
        [experiment.id, experiment.variation],
    )

    return <View>{buttons}</View>
}

export default ExperimentsModalComponent
