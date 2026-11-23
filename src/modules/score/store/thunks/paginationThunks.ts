import { DispatchFun, GetStateFun } from '@mu-native/common'
import { scoreStoreChunk } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

const setNextPage = () => {
    return async (_: DispatchFun, getState: GetStateFun) => {
        const state = getState()
        const currentPage = scoreStoreChunk.props.getCurrentPage(state)
        const totalPages = scoreStoreChunk.props.getTotalPages(state)
        if (currentPage + 1 >= totalPages) return
        xtz.setPage(currentPage + 1)
    }
}

const setPrevPage = () => {
    return async (_: DispatchFun, getState: GetStateFun) => {
        const currentPage = scoreStoreChunk.props.getCurrentPage(getState())
        if (currentPage <= 0) return
        xtz.setPage(currentPage - 1)
    }
}

export const paginationThunks = {
    setNextPage,
    setPrevPage,
}
