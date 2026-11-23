import { marketingStoreChunk } from '../../store/marketingStoreChunk'

export const TIMER_SALE_CONFIG = {
    selectTimerSaleDate: marketingStoreChunk.props.getTimerSaleDate,
    selectTimerSaleStart: marketingStoreChunk.props.getTimerSaleStart,
    setTimerSaleDate: marketingStoreChunk.actions.setTimerSaleDate,
    resetPartialFields: {
        timerSaleStart: null,
        timerSaleDate: null,
    },
}

export const TIMER_SALE_OFF_SCORES_CONFIG = {
    selectTimerSaleDate: marketingStoreChunk.props.getTimerSaleDateOffScores,
    selectTimerSaleStart: marketingStoreChunk.props.getTimerSaleStartOffScores,
    setTimerSaleDate: marketingStoreChunk.actions.setTimerSaleDateOffScores,
    resetPartialFields: {
        timerSaleStartOffScores: null,
        timerSaleDateOffScores: null,
    },
}
