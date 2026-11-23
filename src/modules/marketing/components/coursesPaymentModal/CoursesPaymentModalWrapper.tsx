import { useEffect, useState } from 'react'

import { platform } from '@mu-native/common'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import reportEvent from '../../../../App/Utils/Analytics'
import { marketingStoreChunk } from '../../index'

import CoursesPaymentModal from './components/CoursesPaymentModalComponent'

type Props = {
    onTabletModalChange: (isVisible: boolean) => void
}

export const CoursesPaymentModalWrapper = ({ onTabletModalChange }: Props) => {
    const [hasCoursesPro, hasLearningLite, timerSaleStart, subscriptions, isAccessRightsLoaded] =
        useValues([
            marketingStoreChunk.props.getIsCourses,
            marketingStoreChunk.props.getIsLearningLite,
            marketingStoreChunk.props.getTimerSaleStart,
            marketingStoreChunk.props.getSubscriptions,
            marketingStoreChunk.props.getIsAccessRightsLoaded,
        ])
    const [isShowPaymentModal, setShowPaymentModal] = useState(true)

    const onHidePaymentModal = () => {
        reportEvent(RT_EVENTS.COURSES_LANDING_CLOSE)
        setShowPaymentModal(false)
    }

    const hasCoursesAccess = hasCoursesPro || hasLearningLite
    const isTabletPaymentModal = platform.isTablet && !hasCoursesAccess && !timerSaleStart

    useEffect(() => {
        onTabletModalChange(isTabletPaymentModal)
    }, [isTabletPaymentModal])

    if (
        !isShowPaymentModal ||
        hasCoursesAccess ||
        timerSaleStart ||
        !subscriptions?.length ||
        !isAccessRightsLoaded
    )
        return null

    return <CoursesPaymentModal onHideModal={onHidePaymentModal} />
}
