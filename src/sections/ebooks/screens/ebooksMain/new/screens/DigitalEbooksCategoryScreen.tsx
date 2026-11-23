import { useEffect } from 'react'

import { BrandAppLoader } from '@mu-native/ds'
import { useAppRoute, useNavHeader } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalEbooksCategoryListView } from '../components/category/DigitalEbooksCategoryListView'
import { useDigitalEbooksCategoryChunk } from '../stores/digital.ebooks.category.store'

export const DigitalEbooksCategoryScreen = () => {
    const params = useAppRoute<any>()
    const chunk = useDigitalEbooksCategoryChunk()
    const [isInitialLoading] = useValues([chunk.props.getIsInitialLoading])
    const actions = useActions({ fetchInitial: digitalEbooksThunk.fetchCategory })

    useNavHeader(params.title)

    useEffect(() => {
        actions.fetchInitial(chunk)
    }, [actions, chunk])

    if (isInitialLoading) return <BrandAppLoader />

    return <DigitalEbooksCategoryListView />
}
