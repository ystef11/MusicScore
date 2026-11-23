import { memo, useEffect } from 'react'

import { useActions } from '@ug/store'

import { dynamicDecorThunks } from '../store/dynamicDecorThunks'

const CheckActiveDecorContainer = () => {
    const actions = useActions({ getPromotionalPeriods: dynamicDecorThunks.getPromotionalPeriods })

    useEffect(() => {
        actions.getPromotionalPeriods()
    }, [])

    return null
}

export default memo(CheckActiveDecorContainer)
