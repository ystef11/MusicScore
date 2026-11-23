import { memo, useEffect } from 'react'

import { getExperiments } from '@mu-native/ab'
import { authThunks } from '@mu-native/auth'
import { marketingThunks } from '@mu-native/marketing'
import { useActions } from '@ug/store'

import AppMuseScore from '../App/AppMuseScore'

const MainAppContainer = () => {
    const actions = useActions({
        getExperiments,
        loadDynamicFieldContentCount: marketingThunks.loadDynamicFieldContentCount,
        getServerValuesThunk: authThunks.getServerValuesThunk,
    })

    useEffect(() => {
        actions.getExperiments(0)
        actions.loadDynamicFieldContentCount()
        actions.getServerValuesThunk()
    }, [])

    return <AppMuseScore />
}

export default memo(MainAppContainer)
