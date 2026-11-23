import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
    Keyboard,
    ScrollView,
    type ScrollViewInstance,
    StyleSheet,
    Text,
    type TextInputInstance,
    View,
} from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { device, generalModule } from '@mu-native/common'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import {
    CourseDetailsContext,
    createCourseDetailsDynamicStoreChunk,
    useCourseDetailsContext,
} from '@mu-native/course-details'
import {
    AppText,
    BrandAppLoader,
    brandColors,
    colors,
    CommonTouchable,
    Icon,
    layout,
    MuseButton,
    NativeBottomSheet,
    NativeBottomSheetRef,
} from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import {
    billingThunks,
    marketingConstants,
    marketingStoreChunk,
    marketingThunks,
} from '@mu-native/marketing'
import { Screen, useAppNavigation, useAppRoute, useNavigation } from '@mu-native/navigation'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'
import throttle from 'lodash.throttle'

import VideoPlayer from '../../../Components/VideoPlayer/VideoPlayer'
import MetricaEvents from '../../../constants/MetricaEvents'
import { COLOR_GREY_600, COLOR_GREY_900, COLOR_WHITE } from '../../../constants/styles'
import { SegmentControl } from '../../../Elements/segmentControl/SegmentControl'
import reportEvent from '../../../Utils/Analytics'
import { isIOS, isTablet } from '../../../Utils/Platform'
import About from '../../Components/about/About'
import CommentInput from '../../Components/commentInput/CommentInput'
import Comments from '../../Components/Comments'
import DownloadMaterials from '../../Components/DownloadMaterials.tsx'
import Lessons from '../../Components/lessons/Lessons'
import PaymentButton from '../../Components/PaymentButton'
import {
    loadCourseContent,
    loadCourseInfo,
    sendComment,
    startProgress,
    tryRateCourse,
    updateCourseProgress,
} from '../../coursesActionsAsync'
import type { TCourseInfo, TLesson, TMaterial, TProgress } from '../../coursesTypes'
import { CoursesFeedback, CoursesFeedbackParams } from '../../feedback/CoursesFeedback.tsx'
import ScreenCourseHeader from '../../ScreenCourseHeader'

import BottomSheetCourseModal from './components/BottomSheetCourseModal'

interface IProps {
    updateProgress: (
        materialId: string,
        duration: number,
        lesson: TLesson,
        contentId: number,
    ) => void
    showDownloadModal: (lessonName: string, materials: TMaterial[]) => void
    rateCourse: (
        rating: number,
        courseTrackingId: number,
        lessonId: number,
        materialId: number,
    ) => void
}

const array5Length = Array.from(new Array(5))

const PDFLesson = ({ activeLesson }: { activeLesson: number }) => {
    const courseDetailsChunk = useCourseDetailsContext()
    const [courseInfo] = useValues([courseDetailsChunk.props.getCourseInfo])

    if (!courseInfo) return null

    return (
        <View style={styles.pdfContainer}>
            <Text style={styles.pdfTitle}>
                {translate('native.courses.lesson_number', { number: String(activeLesson + 1) })}
            </Text>
            <Text style={styles.pdfSubtitle}>{courseInfo.lessons[activeLesson].name}</Text>
            <Text style={styles.pdfDescription}>{translate('native.courses.pdf_lesson')}</Text>
        </View>
    )
}

const ScreenCourse = ({ updateProgress, showDownloadModal, rateCourse }: IProps) => {
    const navigation = useAppNavigation()
    const courseDetailsChunk = useCourseDetailsContext()
    const [
        isAuthorized,
        courseInfo,
        content,
        filters,
        isLoadingCourseInfo,
        units,
        hasCoursesAccess,
        needShowFeedbackModal,
        creditBalance,
        currentSubscriptionId,
        hasLearningLite,
    ] = useValues([
        getIsAuthorized,
        courseDetailsChunk.props.getCourseInfo,
        courseDetailsChunk.props.getContent,
        courseBrowseStoreChunk.props.getFilters,
        courseDetailsChunk.props.getIsLoadingCourseInfo,
        courseDetailsChunk.props.getUnits,
        marketingStoreChunk.props.getIsCourses,
        courseDetailsChunk.props.getNeedShowFeedbackModal,
        marketingStoreChunk.props.getCourseBalance,
        marketingStoreChunk.props.getCurrentSubscriptionProductId,
        marketingStoreChunk.props.getIsLearningLite,
    ])
    const actions = useActions({
        buyCourseByCreditThunk: billingThunks.buyCourseByCreditThunk,
        loadCourseInfo,
        loadCourseContent,
        showAuthModal: authStoreChunk.actions.setIsVisible,
        sendComment,
        startProgress,
        setSource: marketingStoreChunk.actions.setSource,
        loadUserBalance: marketingThunks.loadUserBalance,
    })
    const params = useAppRoute<{ courseId: string; isEditorPicks: boolean; trackingId: string }>()

    const changeSource = useCallback((isLearnLite: boolean) => {
        actions.setSource(
            marketingConstants.sources[
                isLearnLite ? 'catalogBannerEditorPicks' : 'coursesBottomCTA'
            ],
        )
    }, [])

    const buyCourseByCredit = useCallback(
        (courseId?: string) => {
            if (!courseId) return

            actions.buyCourseByCreditThunk({ courseId })
            actions.loadUserBalance()
        },
        [actions],
    )

    const isCoursesStatus = hasCoursesAccess || !!courseInfo?.has_access
    const isUserHasCreditBalance = creditBalance > 0
    const isLearningLite =
        marketingConstants.plansForUpgradeLite.includes(currentSubscriptionId) ||
        (hasLearningLite && creditBalance > 0)

    const [activeIndex, setActiveIndex] = useState(0)
    const [activeUnit, setActiveUnit] = useState(0)
    const [expandedUnit, setExpandedUnit] = useState(0)
    const [activeLesson, setActiveLesson] = useState(0)
    const [lessonStartTime, setLessonStartTime] = useState(0)
    const [commentText, setCommentText] = useState('')
    const [commentId, setCommentId] = useState(0)
    const [isVideoVisible, setIsVideoVisible] = useState(false)
    const [materialType, setMaterialType] = useState('STREAM_HLS')
    const [materials, setMaterials] = useState<TCourseInfo['materials']>([])

    const videoSettings = useRef({ startTime: 0, volumeChanged: false, paused: true })

    const segments = useMemo(
        () => [
            translate('native.courses.lessons'),
            translate('native.courses.about'),
            translate('native.courses.comments'),
        ],
        [],
    )

    const scrollRef = useRef<ScrollViewInstance | null>(null)
    const commentInputRef = useRef<TextInputInstance | null>(null)

    useEffect(() => {
        reportEvent(MetricaEvents.COURSE_VIEW, {
            course_id: params.trackingId,
            screen: Screen.courseMain,
        })
        if (!videoSettings.current.volumeChanged) {
            generalModule
                .getVolume()
                .then(currentVolume => {
                    if (currentVolume < 0.35) {
                        generalModule.setVolume(0.35, true)
                    }
                })
                .catch(err => {
                    console.warn('Failed to get current volume:', err)
                })
            videoSettings.current.volumeChanged = true
        }

        actions.loadCourseInfo(courseDetailsChunk, 'online')
    }, [actions, courseDetailsChunk, params.trackingId])

    const doUpdateProgress = useCallback(
        throttle(
            ({
                courseInfo,
                duration,
                lesson,
                unitId,
            }: {
                courseInfo: TCourseInfo
                duration: number
                lesson: TLesson
                unitId: number
            }) => {
                const materials = courseInfo.materials.filter(
                    (item: TMaterial) => item.lesson_id === lesson.id,
                )

                const material = materials.find(
                    (item: TMaterial) => item.placement === 'LESSON_MAIN_MATERIAL',
                )
                const time = Math.round(duration - videoSettings.current.startTime)
                const tempTime = time % 5
                const viewing_time = tempTime > 0 ? tempTime : 5
                if (material && time > 0) {
                    reportEvent(MetricaEvents.LESSON_WATCH, {
                        content_index: lesson.order,
                        lesson_id: lesson.tracking_id,
                        content_id: material.tracking_id,
                        content_type: material.type,
                        content_placement: material.placement,
                        content_length: lesson.duration,
                        viewing_time,
                        course_id: courseInfo.course.tracking_id,
                        unit_id: unitId,
                        ...courseInfo.tracking,
                        ...material.tracking,
                    })

                    updateProgress(material.id, duration, lesson, material.tracking_id)
                }
            },
            5000,
        ),
        [],
    )

    const handleLessonProgress = (duration: number) => {
        const lesson = units[activeUnit]?.lessons[activeLesson]

        if (!lesson) return

        if (!videoSettings.current.startTime) {
            videoSettings.current.startTime = duration
        }

        if (courseInfo) {
            doUpdateProgress({ courseInfo, duration, lesson, unitId: units[activeUnit].id })
        }
    }

    const onOpenLanding = useCallback(
        (isLearnLite: boolean) => {
            if (!courseInfo) {
                return null
            }
            changeSource(isLearnLite)
            if (params?.isEditorPicks && isUserHasCreditBalance) {
                buyCourseByCredit(courseInfo.course.id)
                setTimeout(() => {
                    actions.loadCourseInfo(courseDetailsChunk, 'online')
                }, 500)

                return null
            }
            reportEvent(MetricaEvents.COURSE_CLICK_BUTTON_CTA, { ...courseInfo.tracking })

            navigation.push(Screen.screenLongLanding, {
                planName: isLearnLite ? 'learningLite' : 'learning',
                courseInfo: { id: courseInfo?.course.id, name: courseInfo?.course?.name },
            })
            return null
        },
        [
            actions,
            buyCourseByCredit,
            changeSource,
            courseDetailsChunk,
            courseInfo,
            isUserHasCreditBalance,
            navigation,
            params?.isEditorPicks,
        ],
    )

    const handleEnd = useCallback(() => {
        if (!courseInfo) return
        reportEvent(MetricaEvents.LESSON_END, { ...courseInfo.tracking })

        const hasNextLesson = activeLesson < units[activeUnit].lessons.length - 1
        if (isCoursesStatus && hasNextLesson) {
            // Small delay to let the player finish its end state before switching
            setTimeout(() => {
                handleLessonChange(activeUnit, activeLesson + 1, true)
            }, 300)
        }
    }, [courseInfo, isCoursesStatus, activeLesson, activeUnit, units])

    const handleRateCourse = (rating: number) => {
        if (!isAuthorized) {
            actions.showAuthModal(true)
            return
        }

        if (!courseInfo) return

        const lesson = units[activeUnit].lessons[activeLesson]
        const material = courseInfo.materials
            .filter((item: TMaterial) => item.lesson_id === lesson.id)
            .find((item: TMaterial) => item.placement === 'LESSON_MAIN_MATERIAL')

        if (material) {
            rateCourse(
                rating,
                courseInfo?.course?.tracking_id,
                lesson.tracking_id,
                material.tracking_id,
            )
        }
        reportEvent(MetricaEvents.COURSE_RATING_CLICK, {
            course_id: courseInfo?.course?.tracking_id,
        })
    }

    const handlePlay = (currentTime: number) => {
        if (!courseInfo) {
            return
        }

        videoSettings.current.startTime = currentTime
        videoSettings.current.paused = false

        reportEvent(MetricaEvents.LESSON_PLAY, {
            ...courseInfo.tracking,
            item: 'lesson',
            item_id: units[activeUnit].lessons[activeLesson].id,
            course_id: courseInfo?.course?.tracking_id,
        })
        reportEvent(MetricaEvents.LESSON_PLAY_CLICK, {
            course_id: courseInfo?.course?.tracking_id,
            lesson_id: units[activeUnit].lessons[activeLesson]?.tracking_id,
        })
    }

    const handlePause = (currentTime: number) => {
        videoSettings.current.paused = true

        if (!courseInfo) {
            return
        }

        const lesson = units[activeUnit].lessons[activeLesson]

        const materials = courseInfo.materials.filter(
            (item: TMaterial) => item.lesson_id === lesson.id,
        )

        const material = materials.find(
            (item: TMaterial) => item.placement === 'LESSON_MAIN_MATERIAL',
        )

        const viewing_time = Math.round(currentTime - videoSettings.current.startTime)

        if (material && viewing_time > 0) {
            reportEvent(MetricaEvents.LESSON_WATCH, {
                content_index: lesson.order,
                lesson_id: lesson.tracking_id,
                content_id: material.tracking_id,
                content_type: material.type,
                content_placement: material.placement,
                content_length: lesson.duration,
                viewing_time,
                course_id: courseInfo.course.tracking_id,
                unit_id: units[activeUnit].id,
                ...courseInfo.tracking,
                ...material.tracking,
            })
            videoSettings.current.startTime = 0
        }

        reportEvent(MetricaEvents.LESSON_PAUSE, {
            ...courseInfo.tracking,
            item: 'lesson',
            item_id: units[activeUnit].lessons[activeLesson].id,
            course_id: courseInfo?.course?.tracking_id,
        })
        reportEvent(MetricaEvents.LESSON_PLAY_CLICK, {
            course_id: courseInfo?.course?.tracking_id,
            lesson_id: units[activeUnit].lessons[activeLesson].tracking_id,
        })
    }

    const handleSeek = () => {
        videoSettings.current.startTime = 0
    }

    const handleReadyForDisplay = () => {
        if (!courseInfo) {
            return
        }

        const isLessonStarted = !!courseInfo.progress.find(
            (item: TProgress) => item.lesson_id === units[activeUnit].lessons[activeLesson].id,
        )

        const materials = courseInfo.materials.filter(
            (item: TMaterial) => item.lesson_id === units[activeUnit].lessons[activeLesson].id,
        )

        const material = materials.find(
            (item: TMaterial) => item.placement === 'LESSON_MAIN_MATERIAL',
        )

        if (!isLessonStarted) {
            if (material) {
                reportEvent(MetricaEvents.LESSON_START, { ...courseInfo.tracking })
                actions.startProgress(
                    courseDetailsChunk,
                    material.id,
                    units[activeUnit].lessons[activeLesson].id,
                )
            }
        }
    }

    const handleShowDownloadModal = () => {
        showDownloadModal(units[activeUnit].lessons[activeLesson].name, materials)
    }

    const handleNormalMode = () => {
        if (!courseInfo) return
        reportEvent(MetricaEvents.LESSON_FULL_MODE_TURN, { ...courseInfo.tracking, value: 'off' })
    }

    const handleFullScreenMode = () => {
        if (!courseInfo) return
        reportEvent(MetricaEvents.LESSON_FULL_MODE_TURN, { ...courseInfo.tracking, value: 'on' })
    }

    const handleReply = (commentId: number, userName: string, offset: number) => {
        setCommentId(commentId)
        setCommentText(`@${userName}, `)

        commentInputRef.current?.focus()
    }

    const handleChangeText = (commentText: string) => {
        setCommentText(commentText)

        if (!commentText) {
            setCommentId(0)
        }
    }

    const handleSubmit = () => {
        const body = commentText.trim()

        if (!body) return

        actions.sendComment(courseDetailsChunk, body, commentId)
        setCommentText('')
        setCommentId(0)
        Keyboard.dismiss()
    }

    const handleInputFocus = () => {
        if (!courseInfo) {
            return
        }

        reportEvent(MetricaEvents.COURSE_COMMENT_FOCUS, { ...courseInfo.tracking })
    }

    const handleSegmentChange = (activeIndex: number) => {
        setActiveIndex(activeIndex)
    }

    const handleUnitChange = (expandedUnit: number, unitId: number) => {
        setExpandedUnit(expandedUnit)
        const trackingId = params?.trackingId
        reportEvent(MetricaEvents.COURSE_UNIT_OPEN, {
            screen: Screen.courseMain,
            course_id: trackingId,
            unit_id: unitId,
        })
    }

    const handleLessonChange = (activeUnit: number, activeLesson: number, isAvailable: boolean) => {
        const lesson = units[activeUnit].lessons[activeLesson]

        reportEvent(MetricaEvents.LESSON_CLICK, {
            course_id: courseInfo?.course?.tracking_id,
            lesson_id: lesson?.tracking_id,
        })
        videoSettings.current.startTime = 0

        const isGoToLanding = activeUnit === 0 ? activeLesson !== 0 : true
        if (isGoToLanding && !isCoursesStatus) {
            return onOpenLanding(false)
        }

        if (!courseInfo || !isAvailable) {
            return null
        }

        const materials = courseInfo.materials.filter(
            (item: TMaterial) => item.lesson_id === lesson.id,
        )

        setMaterials(
            materials.filter((item: TMaterial) => item.placement === 'LESSON_ADDITIONAL_FILES'),
        )

        const material = materials.find(
            (item: TMaterial) => item.placement === 'LESSON_MAIN_MATERIAL',
        )

        if (material) {
            setActiveUnit(activeUnit)
            setActiveLesson(activeLesson)
            setMaterialType(material?.type)
            actions.loadCourseContent(courseDetailsChunk, material.id)
            scrollRef.current?.scrollTo({ x: 0, y: 0 })
        }
        if (!videoSettings.current.paused) {
            reportEvent(MetricaEvents.LESSON_PLAY_CLICK, {
                course_id: courseInfo?.course?.tracking_id,
                lesson_id: lesson?.tracking_id,
            })
        }
        return null
    }

    const handleNextLesson = () => {
        handleLessonChange(activeUnit, activeLesson + 1, true)
    }

    const handlePreviousLesson = () => {
        handleLessonChange(activeUnit, activeLesson - 1, true)
    }

    const setStartLesson = () => {
        if (!courseInfo) {
            return
        }

        let activeUnit = -1
        let activeLesson = -1

        for (let i = 0; i < units?.length; i++) {
            for (let j = 0; j < units[i].lessons?.length; j++) {
                if (units[i].lessons[j].id === courseInfo.start_lesson?.id) {
                    activeUnit = i
                    activeLesson = j
                    break
                }
            }

            if (activeLesson >= 0) {
                break
            }
        }

        if (activeUnit >= 0 && activeLesson >= 0) {
            const lessonStartTime =
                courseInfo.progress.find(
                    (item: TProgress) =>
                        item.lesson_id === units[activeUnit].lessons[activeLesson].id,
                )?.duration || 0
            videoSettings.current.startTime = lessonStartTime
            setLessonStartTime(lessonStartTime)
            handleLessonChange(activeUnit, activeLesson, true)
        }

        setIsVideoVisible(true)
    }

    useEffect(() => {
        if (courseInfo) {
            const lesson = units[activeUnit]?.lessons[activeLesson]
            reportEvent(MetricaEvents.LESSON_VIEW, {
                course_id: courseInfo?.course?.tracking_id,
                lesson_id: lesson?.tracking_id,
            })
            setTimeout(setStartLesson, 500)
        }
    }, [courseInfo?.start_lesson?.id])

    useEffect(() => {
        if (isCoursesStatus && params.courseId) {
            actions.loadCourseInfo(courseDetailsChunk, 'online')
        }
    }, [])

    const tabContent = courseInfo
        ? [
              <Lessons
                  key="lessons"
                  units={units}
                  activeUnit={activeUnit}
                  expandedUnit={expandedUnit}
                  activeLesson={activeLesson}
                  lessonsCount={courseInfo.course.lesson_count}
                  lessonsDuration={courseInfo.course.duration}
                  onUnitChange={handleUnitChange}
                  onLessonChange={handleLessonChange}
                  progress={courseInfo.progress}
              />,
              <About key="about" course={courseInfo.course} filters={filters} />,
              <Comments key="comments" onReply={handleReply} />,
          ][activeIndex]
        : null

    if (isLoadingCourseInfo || !courseInfo || !units) {
        return (
            <View style={styles.loaderContiner}>
                <BrandAppLoader />
            </View>
        )
    }

    const lesson = units[activeUnit].lessons[activeLesson]
    const needShowRating = courseInfo.has_access

    return (
        <>
            <ScrollView
                ref={scrollRef}
                testID={coursesTestIds.courseDetails.screen}
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* eslint-disable-next-line no-nested-ternary */}
                {isVideoVisible ? (
                    materialType === 'STREAM_HLS' ? (
                        <VideoPlayer
                            source={{ uri: content }}
                            duration={lesson.duration}
                            lessonStartTime={lessonStartTime}
                            hasPrevious={!!activeLesson}
                            hasNext={activeLesson !== units[activeUnit].lessons.length - 1}
                            previousLesson={handlePreviousLesson}
                            nextLesson={handleNextLesson}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onProgress={handleLessonProgress}
                            onNormalMode={handleNormalMode}
                            onFullScreenMode={handleFullScreenMode}
                            onReadyForDisplay={handleReadyForDisplay}
                            navigation={navigation}
                            activeLesson={activeLesson}
                            isCoursesStatus={isCoursesStatus}
                            courseTitle={courseInfo.course.name}
                            onEnd={handleEnd}
                            onSeek={handleSeek}
                        />
                    ) : (
                        <PDFLesson activeLesson={activeLesson} />
                    )
                ) : (
                    <View style={styles.backgroundVideo} />
                )}
                {isVideoVisible && isIOS ? (
                    <PanGestureHandler activeOffsetX={[-0, 0]}>
                        <View style={styles.plug} />
                    </PanGestureHandler>
                ) : null}
                <AppText
                    testID={coursesTestIds.courseDetails.title}
                    font="f44w400Accent"
                    style={styles.title}
                    rawText={courseInfo?.course?.name ?? ''}
                />
                {materials?.length ? (
                    <MuseButton
                        onPress={handleShowDownloadModal}
                        style={styles.downLoadButton}
                        title={translate(
                            materials?.length > 1
                                ? 'native.courses.download_materials'
                                : 'native.courses.download_material',
                            { number: materials?.length.toString() },
                        )}
                    />
                ) : null}
                {(!courseInfo?.course?.rating?.user_rating || needShowFeedbackModal) && (
                    <MuseButton
                        type="secondary"
                        title={translate('native.courses.send_feedback')}
                        style={styles.buttonFeedback}
                        onPress={() =>
                            handleRateCourse(courseInfo?.course?.rating?.user_rating ?? 0)
                        }
                    />
                )}
                <View style={styles.segmentsContainer}>
                    <SegmentControl
                        testID={coursesTestIds.courseDetails.tabs}
                        segments={segments}
                        onChange={handleSegmentChange}
                        activeIndex={activeIndex}
                        getSegmentTestID={(_, index) =>
                            [
                                coursesTestIds.courseDetails.lessonsTab,
                                coursesTestIds.courseDetails.aboutTab,
                                coursesTestIds.courseDetails.commentsTab,
                            ][index]
                        }
                    />
                </View>
                {needShowRating && activeIndex === 0 ? (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingTitle}>
                            {translate('native.courses.rate_course')}
                        </Text>
                        <View style={styles.starsContainer}>
                            {array5Length?.map((_: any, index: number) => (
                                <CommonTouchable
                                    isHapticEnabled
                                    key={`${index.toString()}`}
                                    style={index < 4 ? styles.starButton : {}}
                                    onPress={() => handleRateCourse(index + 1)}
                                >
                                    <Icon
                                        source={star}
                                        size={24}
                                        tint={
                                            index < (courseInfo.course.rating.user_rating ?? 0)
                                                ? brandColors.contentPrimary
                                                : brandColors.contentTertiary
                                        }
                                    />
                                </CommonTouchable>
                            ))}
                        </View>
                    </View>
                ) : null}
                {tabContent}
            </ScrollView>
            {isAuthorized && activeIndex === 2 && courseInfo.has_access ? (
                <CommentInput
                    inputRef={commentInputRef}
                    value={commentText}
                    onChangeText={handleChangeText}
                    onSubmit={handleSubmit}
                    onFocus={handleInputFocus}
                />
            ) : null}
            <PaymentButton
                isLearnLite={params?.isEditorPicks}
                isCoursesStatus={isCoursesStatus}
                goLanding={onOpenLanding}
                isUserHasCreditBalance={isUserHasCreditBalance}
            />
            {isVideoVisible && !isCoursesStatus && isLearningLite && (
                <BottomSheetCourseModal
                    courseId={params?.courseId}
                    courseName={courseInfo?.course?.name}
                    isEditorPicks={params?.isEditorPicks}
                />
            )}
        </>
    )
}

const ScreenCourseFunc = (props: any) => {
    const { setOptions } = useNavigation()
    const infoSheetRef = useRef<NativeBottomSheetRef>(null)
    const feedbackSheetRef = useRef<NativeBottomSheetRef>(null)
    const actions = useActions({
        tryRateCourse,
        updateCourseProgress,
        resetCourseAnalytics: courseBrowseStoreChunk.actions.setAnalyticsOnlyVisibleCourseInfo,
    })

    const { courseId } = useAppRoute<{ courseId: string }>()
    const { chunk } = useInjectDynamicStoreChunk('screen_course', key =>
        createCourseDetailsDynamicStoreChunk(key, courseId),
    )

    useEffect(() => {
        return () => {
            actions.resetCourseAnalytics(null)
        }
    }, [])

    useLayoutEffect(() => {
        const { route } = props
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => <ScreenCourseHeader title={route?.params?.title} chunk={chunk} />,
        })
    }, [])

    const showDownloadModal = useCallback((lessonName: string, materials: TMaterial[]) => {
        infoSheetRef.current?.present({ lessonName, materials })
    }, [])

    const showFeedbackModal = useCallback(
        (
            feedbackParams: {
                lessonId: number
                contentId: number
                source: string
            },
            feedbackStep: number,
            userRating: number,
        ) => {
            feedbackSheetRef.current?.present({
                params: { feedbackParams, feedbackStep, userRating },
            } as Omit<CoursesFeedbackParams, 'onDismiss'>)
        },
        [],
    )

    const updateProgress = useCallback(
        (material_id: string, duration: number, lesson: TLesson, contentId: number) => {
            actions.updateCourseProgress(
                chunk,
                material_id,
                duration,
                lesson,
                contentId,
                showFeedbackModal,
            )
        },
        [actions, chunk, showFeedbackModal],
    )

    const onFeedbackDismiss = useCallback(() => {
        feedbackSheetRef.current?.dismiss()
    }, [])

    const rateCourse = useCallback(
        (rating: number, courseTrackingId: number, lessonId: number, contentId: number) => {
            actions.tryRateCourse(
                chunk,
                rating,
                courseTrackingId,
                lessonId,
                contentId,
                showFeedbackModal,
            )
        },
        [chunk, actions, showFeedbackModal],
    )

    return (
        <CourseDetailsContext.Provider value={chunk}>
            <ScreenCourse
                showDownloadModal={showDownloadModal}
                rateCourse={rateCourse}
                updateProgress={updateProgress}
            />
            <NativeBottomSheet ref={infoSheetRef}>
                {info => {
                    return (
                        <DownloadMaterials
                            courseDetailsChunk={chunk}
                            lessonName={info.lessonName}
                            materials={info.materials}
                        />
                    )
                }}
            </NativeBottomSheet>
            <NativeBottomSheet ref={feedbackSheetRef}>
                {(info: Omit<CoursesFeedbackParams, 'onDismiss' | 'courseDetailsChunk'>) => {
                    return (
                        <CoursesFeedback
                            {...info}
                            onDismiss={onFeedbackDismiss}
                            courseDetailsChunk={chunk}
                        />
                    )
                }}
            </NativeBottomSheet>
        </CourseDetailsContext.Provider>
    )
}

const styles = StyleSheet.create({
    title: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    ratingTitle: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: colors.text900,
    },
    buttonFeedback: {
        margin: 16,
    },

    loaderContiner: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
    pdfContainer: {
        width: device.screenData.width,
        height: device.screenData.width * 0.563,
        backgroundColor: colors.white100,
        padding: 16,
    },
    pdfTitle: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        color: COLOR_GREY_900,
        marginTop: 8,
        marginBottom: 4,
    },
    pdfSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: COLOR_GREY_900,
    },
    pdfDescription: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: COLOR_GREY_600,
        marginTop: 12,
    },
    plug: {
        width: 60,
        height: 20,
        position: 'absolute',
        top: device.screenData.width * 0.59,
        left: 0,
        zIndex: 2,
    },

    segmentsContainer: {
        ...(isTablet ? { alignItems: 'flex-start' } : {}),
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
    },

    downLoadButton: {
        margin: 16,
    },

    ratingContainer: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    starsContainer: {
        flexDirection: 'row',
    },

    starButton: {
        marginRight: 8,
    },

    backgroundVideo: {
        backgroundColor: colors.black,
        width: layout.fullScreenWidth,
        height: layout.fullScreenWidth * 0.563,
    },
})

export default ScreenCourseFunc
