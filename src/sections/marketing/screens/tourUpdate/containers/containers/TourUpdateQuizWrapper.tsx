import { useEffect } from 'react'

import { marketingConstants } from '@mu-native/marketing'
import { quizStoreChunk, TourQuizContainer } from '@mu-native/quiz'
import { useValues } from '@ug/store'

type TTourQuizWrapperContainerProps = {
    setNextStep: () => void
}
export const TourQuizWrapperContainer = ({ setNextStep }: TTourQuizWrapperContainerProps) => {
    const [quizStep, lastQuizStep] = useValues([
        quizStoreChunk.props.getQuizStep,
        quizStoreChunk.props.getLastQuizStep,
    ])
    const isHideQuiz = quizStep > lastQuizStep

    useEffect(() => {
        if (isHideQuiz) setNextStep()
    }, [isHideQuiz])

    if (isHideQuiz) return null
    return <TourQuizContainer source={marketingConstants.sources.appleWatchMetronome} />
}
