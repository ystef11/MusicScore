import { marketingStoreChunk } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { quizHelpers } from '@mu-native/quiz'
import { scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'

export const useAutoGradeLogic = () => {
    const [scoreUri, score, isAutoGradeRights] = useValues([
        scoreStoreChunk.props.getScoreUri,
        scoreStoreChunk.props.getCurrentScore,
        marketingStoreChunk.props.getIsAutoGradeRights,
    ])

    const { navigate } = useAppNavigation()

    const onNavigateAutoGradeScreen = () => {
        reportEvent(RT_EVENTS.SCORE_PRACTICE_MODE_CLICK, getScoreMetaEvent(score))
        reportEvent(RT_EVENTS.SCORE_AUTOGRADE_CLICK, quizHelpers.getUserInstrumentsFromTour())
        navigate('AutogradeScreen', { uri: scoreUri, score })
    }

    return {
        isAutoGradeRights,
        onNavigateAutoGradeScreen,
    }
}
