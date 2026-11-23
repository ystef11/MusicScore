import { LaunchArguments } from 'react-native-launch-arguments'

import { abContracts, apiRequest } from '@mu-native/api'

interface MyExpectedArgs {
    experiments?: string | Record<string, number>
    reset_all_experiments?: boolean | string
}

interface RewrittenExperimentsResult {
    experiments?: Record<string, number>
    reset_all_experiments?: boolean
}

const getExperiments = () => apiRequest(abContracts.experiments)

const rewrittenExperiments: RewrittenExperimentsResult = (() => {
    const args = LaunchArguments.value<MyExpectedArgs>()
    console.log('@@get ab launch arguments', args)

    if (args?.reset_all_experiments === true || args?.reset_all_experiments === 'true') {
        return { experiments: {}, reset_all_experiments: true }
    }

    if (args?.experiments) {
        try {
            if (typeof args?.experiments === 'string') {
                return {
                    experiments: JSON.parse(args.experiments) as Record<string, number>,
                }
            }
            return { experiments: args?.experiments }
        } catch (e) {
            console.error('Failed to parse experiments JSON:', e)
        }
    }
    return {}
})()

const clientTimeHeaders = () => [
    { title: 'x-mu-client-time', get: () => String(Math.round(Date.now())) },
    {
        title: 'x-mu-client-time-offset',
        get: () => String(new Date().getTimezoneOffset() * 60),
    },
]

const setVariation = (experimentId: number, variation: number) =>
    apiRequest(abContracts.setVariation, {
        headerParams: clientTimeHeaders(),
        payload: { experiment_id: experimentId, variation },
    })

const updateSession = async (_experimentsIds: string) => {}

export const abServices = {
    getExperiments,
    rewrittenExperiments,
    setVariation,
    updateSession,
}
