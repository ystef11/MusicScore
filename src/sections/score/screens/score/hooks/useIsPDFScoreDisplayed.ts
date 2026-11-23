import { useCurrentScore } from './useCurrentScore'

export const useIsPDFScoreDisplayed = () => {
    const score = useCurrentScore()
    return score?.isPdf
}
