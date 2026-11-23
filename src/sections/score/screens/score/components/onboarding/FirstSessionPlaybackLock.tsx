import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BackHandler, NativeEventSubscription, Pressable, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import {
    AppText,
    AppToast,
    FadeAnimationComponent,
    PopoverMode,
    PopoverPlacement,
    Rect,
    Tooltip,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { useFirstSessionOnboarding } from './useFirstSessionOnboarding'

const HINT_VISIBLE_MS = 2500

const HOLE_PADDING = 8
const noop = () => undefined

const styles = StyleSheet.create({
    blocker: {
        ...StyleSheet.absoluteFill,
        zIndex: 12,
    },
    strip: {
        position: 'absolute',
        zIndex: 12,
    },
    hintLayer: {
        ...StyleSheet.absoluteFill,
        zIndex: 13,
    },
    saveHintLayer: {
        ...StyleSheet.absoluteFill,
        zIndex: 13,
    },
})

export const FirstSessionPlaybackLock = memo(() => {
    const { navigate } = useAppNavigation()
    const insets = useAppSafeArea()
    const { playbackLockMs, isSaveHintVariation } = useFirstSessionOnboarding()
    const [isLocked, isPlaying, isSaveHintShown, likeRect, isPro, isOffScores] = useValues([
        scoreStoreChunk.props.getIsFirstSessionPlaybackLocked,
        scoreStoreChunk.props.getIsPlaying,
        scoreStoreChunk.props.getIsFirstSessionSaveHintShown,
        scoreStoreChunk.props.getFirstSessionLikeRect,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
    ])

    const hasProRights = isPro || isOffScores
    const actions = useActions({
        setLocked: scoreStoreChunk.actions.setIsFirstSessionPlaybackLocked,
        setSaveHintShown: scoreStoreChunk.actions.setIsFirstSessionSaveHintShown,
        togglePlay: scoreThunks.toggleScorePlay,
        setMarketingFields: marketingStoreChunk.actions.setPartialFieldsCustom,
    })

    const anchorRect = useMemo(
        () => likeRect && new Rect(likeRect.x, likeRect.y, likeRect.width, likeRect.height),
        [likeRect],
    )

    const [isHintVisible, setIsHintVisible] = useState(false)

    const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isPlayingRef = useRef(isPlaying)

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    const finishPlaybackLock = useCallback(() => {
        actions.setLocked(false)
        actions.setSaveHintShown(false)

        /**
         * 2 итерация: флоу видят и те, кто купил в туре. Продавать им нечего —
         * просто снимаем блокировку, скор играет дальше, лендинг не открываем.
         */
        if (hasProRights) return

        if (isPlayingRef.current) actions.togglePlay()

        actions.setMarketingFields({ source: sources.firstSession })
        navigate(Screen.screenLongLanding, { isOfficialScore: true })
    }, [actions, hasProRights, navigate])

    const showHint = useCallback(() => {
        setIsHintVisible(true)

        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
        hintTimeoutRef.current = setTimeout(() => setIsHintVisible(false), HINT_VISIBLE_MS)
    }, [])

    const onBlockerPress = useCallback(() => {
        if (isSaveHintShown) {
            finishPlaybackLock()
            return
        }

        if (isSaveHintVariation) {
            actions.setSaveHintShown(true)
            return
        }

        showHint()
    }, [isSaveHintShown, isSaveHintVariation, actions, finishPlaybackLock, showHint])

    useEffect(() => {
        if (isLocked) return

        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
        setIsHintVisible(false)
    }, [isLocked])

    useEffect(() => {
        if (!isLocked || !platform.isAndroid) return undefined

        const listener: NativeEventSubscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                onBlockerPress()
                return true
            },
        )

        return () => listener.remove()
    }, [isLocked, onBlockerPress])

    useEffect(() => {
        // Первый тап в вариации 3 отменяет автопереход: дальше уходим только по действию юзера.
        if (!isLocked || isSaveHintShown) return undefined

        const timeout = setTimeout(finishPlaybackLock, playbackLockMs)

        return () => clearTimeout(timeout)
    }, [isLocked, isSaveHintShown, playbackLockMs, finishPlaybackLock])

    if (!isLocked) return null

    /** Пока координат кнопки нет, дырку вырезать не из чего — блокируем экран целиком. */
    const hole = isSaveHintShown && likeRect ? likeRect : null

    if (!hole) {
        return (
            <>
                <Pressable style={styles.blocker} onPress={onBlockerPress} />
                {isHintVisible && <PlaybackHint offset={insets.top + 8} />}
            </>
        )
    }

    const holeTop = hole.y - HOLE_PADDING
    const holeBottom = hole.y + hole.height + HOLE_PADDING
    const holeStart = hole.x - HOLE_PADDING
    const holeEnd = hole.x + hole.width + HOLE_PADDING
    const rowStyle = { top: holeTop, height: holeBottom - holeTop }

    return (
        <>
            <Pressable
                style={[styles.strip, { top: 0, left: 0, right: 0, height: holeTop }]}
                onPress={onBlockerPress}
            />
            <Pressable
                style={[styles.strip, { top: holeBottom, left: 0, right: 0, bottom: 0 }]}
                onPress={onBlockerPress}
            />
            <Pressable
                style={[styles.strip, rowStyle, { left: 0, width: holeStart }]}
                onPress={onBlockerPress}
            />
            <Pressable
                style={[styles.strip, rowStyle, { left: holeEnd, right: 0 }]}
                onPress={onBlockerPress}
            />
            <View style={styles.saveHintLayer} pointerEvents="box-none">
                <Tooltip
                    visible
                    mode={PopoverMode.TOOLTIP}
                    anchor={anchorRect ?? undefined}
                    placement={PopoverPlacement.LEFT}
                    body={translate('native.score_onboarding.save_hint')}
                    hideCloseButton
                    onClose={noop}
                    onCloseComplete={noop}
                />
            </View>
        </>
    )
})

const PlaybackHint = memo(({ offset }: { offset: number }) => (
    <View style={styles.hintLayer} pointerEvents="none">
        <FadeAnimationComponent duration={200}>
            <AppToast position="top" offset={offset}>
                <AppText
                    adaptiveSize
                    brandColor="exceptionInverseDark"
                    font="f17w400"
                    rawText={translate('native.score_onboarding.playing_one_moment')}
                    numberOfLines={2}
                />
            </AppToast>
        </FadeAnimationComponent>
    </View>
))
