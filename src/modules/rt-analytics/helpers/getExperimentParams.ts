import { TExperiment } from '@mu-native/ab'

export function getExperimentParams(experiments: TExperiment[]) {
    if (!experiments) {
        return {
            'experiments.id': [],
            'experiments.variation': [],
        }
    }

    const ids: number[] = []
    const variations: number[] = []

    experiments.forEach(item => {
        ids.push(item.id)
        variations.push(item.variation)
    })

    return {
        'experiments.id': ids,
        'experiments.variation': variations,
    }
}
