import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import Svg, { ClipPath, Defs, Image as SvgImage, Polygon } from 'react-native-svg'

import { AppText, brandColors, icons, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useWindowDimensions } from '@mu-native/system'

import reportEvent from '../../../../../../../../../App/Utils/Analytics.ts'

// Artwork intrinsic size (viewBox) and on-screen size.
const ART_W = 232
const ART_H = 243
const DISPLAY_W = 240
const DISPLAY_H = Math.round((DISPLAY_W * ART_H) / ART_W)

// Clip polygons (in artwork coordinates)
const CLIP_BODY_1 = '0,0 232,0 232,184.7 181,184.7 194.9,243 139.2,199.3 0,199.3'
const CLIP_BODY_2 =
    '0,0 232,0 232,126.4 171.7,136.1 185.6,175 129.9,140.9 92.8,189.5 55.7,136.1 0,140.9'
const CLIP_CHUNK_1 = '181,184.7 232,184.7 232,243 139.2,243 194.9,243'
const CLIP_CHUNK_2 = '0,126.4 232,126.4 232,243 0,243'

// Confetti shard palette
const SHARD_COLORS = [
    brandColors.playlistBackground3,
    brandColors.playlistBackground5,
    brandColors.statusWarning,
    brandColors.statusError,
    brandColors.playlistBackground2,
    brandColors.playlistBackground1,
    brandColors.statusSuccess,
    brandColors.additionalRating,
    brandColors.playlistBackground4,
    brandColors.playlistBackground6,
]

const rand = (a: number, b: number) => a + Math.random() * (b - a)

const bodyClipForHits = (hits: number): string | null => {
    if (hits === 1) return CLIP_BODY_1
    if (hits === 2) return CLIP_BODY_2
    return null
}

const styles = StyleSheet.create({
    root: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
    stage: {
        width: DISPLAY_W,
        height: DISPLAY_H,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    overlay: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
    pinataBox: { width: DISPLAY_W, height: DISPLAY_H },
    pivot: { transformOrigin: 'top center' },
    hint: { marginTop: layoutHelpers.getResponsiveSizeExtended(28) },
    shard: { position: 'absolute' },
    confetti: { position: 'absolute' },
})

// ── Pinata body (current break state) ─────────────────────────────────────────
const PinataBody = ({ hits }: { hits: number }) => {
    if (hits >= 3) return null
    const clip = bodyClipForHits(hits)

    return (
        <Svg width={DISPLAY_W} height={DISPLAY_H} viewBox={`0 0 ${ART_W} ${ART_H}`}>
            {!!clip && (
                <Defs>
                    <ClipPath id="pinata-body">
                        <Polygon points={clip} />
                    </ClipPath>
                </Defs>
            )}
            <SvgImage
                href={icons.pinata}
                width={ART_W}
                height={ART_H}
                clipPath={clip ? 'url(#pinata-body)' : undefined}
            />
        </Svg>
    )
}

// ── A single broken-off chunk flying away ─────────────────────────────────────
const FlyingChunk = ({
    id,
    points,
    onDone,
}: {
    id: string
    points: string
    onDone: (id: string) => void
}) => {
    const clipId = `clip-${id}`
    const p = useSharedValue(0)
    const motion = useMemo(() => {
        const dir = Math.random() < 0.5 ? -1 : 1
        return { dx: dir * rand(90, 200), dy: rand(120, 240), rot: dir * rand(140, 320) }
    }, [])

    useEffect(() => {
        p.value = withTiming(1, { duration: rand(900, 1300), easing: Easing.out(Easing.cubic) })
        const timer = setTimeout(() => onDone(id), 1400)
        return () => clearTimeout(timer)
    }, [])

    const style = useAnimatedStyle(() => ({
        opacity: 1 - p.value,
        transform: [
            { translateX: p.value * motion.dx },
            { translateY: p.value * motion.dy },
            { rotate: `${p.value * motion.rot}deg` },
        ],
    }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.overlay, style]}
        >
            <Svg width={DISPLAY_W} height={DISPLAY_H} viewBox={`0 0 ${ART_W} ${ART_H}`}>
                <Defs>
                    <ClipPath id={clipId}>
                        <Polygon points={points} />
                    </ClipPath>
                </Defs>
                <SvgImage
                    href={icons.pinata}
                    width={ART_W}
                    height={ART_H}
                    clipPath={`url(#${clipId})`}
                />
            </Svg>
        </Animated.View>
    )
}

// ── One colored shard particle ────────────────────────────────────────────────
const Shard = () => {
    const p = useSharedValue(0)
    const m = useMemo(() => {
        const ang = rand(0, Math.PI * 2)
        const dist = rand(70, 200)
        return {
            dx: Math.cos(ang) * dist,
            dy: Math.sin(ang) * dist - rand(20, 80),
            rot: rand(-540, 540),
            size: rand(9, 22),
            color: SHARD_COLORS[Math.floor(Math.random() * SHARD_COLORS.length)],
            round: Math.random() < 0.5 ? 2 : 999,
        }
    }, [])

    useEffect(() => {
        p.value = withTiming(1, { duration: rand(900, 1500), easing: Easing.out(Easing.cubic) })
    }, [])

    const style = useAnimatedStyle(() => ({
        opacity: 1 - p.value,
        transform: [
            { translateX: p.value * m.dx },
            { translateY: p.value * (m.dy + 280) },
            { rotate: `${p.value * m.rot}deg` },
        ],
    }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.shard,
                { width: m.size, height: m.size, backgroundColor: m.color, borderRadius: m.round },
                style,
            ]}
        />
    )
}

// ── A burst of shards, self-removing ──────────────────────────────────────────
const ShardBurst = ({
    id,
    count,
    onDone,
}: {
    id: string
    count: number
    onDone: (id: string) => void
}) => {
    const shards = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])

    useEffect(() => {
        const timerId = setTimeout(() => onDone(id), 1600)
        return () => clearTimeout(timerId)
    }, [])

    return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay]}>
            {shards.map(i => (
                <Shard key={i} />
            ))}
        </View>
    )
}

// ── Confetti burst on finish ──────────────────────────────────────────────────
const Confetti = ({ progress }: { progress: SharedValue<number> }) => {
    const { width } = useWindowDimensions()
    const w = Math.min(width * 1.1, 680)
    const h = (w * 510) / 658

    const style = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.05, 0.6, 1], [0, 1, 1, 0]),
        transform: [
            { translateY: interpolate(progress.value, [0, 0.28, 1], [0, 0, -h * 0.28]) },
            { scale: interpolate(progress.value, [0, 0.15, 0.28, 1], [0.4, 1.06, 1, 1]) },
        ],
    }))

    return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay]}>
            <Animated.Image
                source={icons.confetti}
                resizeMode="contain"
                style={[styles.confetti, { width: w, height: h }, style]}
            />
        </View>
    )
}

type TChunk = { id: string; points: string }
type TBurst = { id: string; count: number }

export const PinataView = ({ onOpened }: { onOpened: () => void }) => {
    const [hits, setHits] = useState(0)
    const [chunks, setChunks] = useState<TChunk[]>([])
    const [bursts, setBursts] = useState<TBurst[]>([])
    const idRef = useRef(0)
    const isDoneAnimation = hits >= 3

    const shake = useSharedValue(0)
    const confettiP = useSharedValue(0)

    const nextId = () => {
        idRef.current += 1
        return `id-${idRef.current}`
    }

    const spawnChunk = (points: string) => setChunks(prev => [...prev, { id: nextId(), points }])
    const spawnBurst = (count: number) => setBursts(prev => [...prev, { id: nextId(), count }])

    const removeChunk = useCallback(
        (id: string) => setChunks(prev => prev.filter(x => x.id !== id)),
        [],
    )
    const removeBurst = useCallback(
        (id: string) => setBursts(prev => prev.filter(x => x.id !== id)),
        [],
    )

    const triggerShake = () => {
        shake.value = 0
        shake.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) })
    }

    const onTap = () => {
        setHits(prev => {
            if (prev >= 3) return prev
            const next = prev + 1
            triggerShake()
            spawnBurst(16)
            if (next === 1) spawnChunk(CLIP_CHUNK_1)
            if (next === 2) spawnChunk(CLIP_CHUNK_2)
            if (next >= 3) {
                reportEvent(RT_EVENTS.TAP_BOX_OPEN, {
                    'params.key': ['click_count'],
                    'params.str_value': [''],
                    'params.value': [next],
                })

                spawnChunk(CLIP_BODY_2)
                spawnBurst(30)
                confettiP.value = withTiming(1, {
                    duration: 2400,
                    easing: Easing.out(Easing.cubic),
                })
                setTimeout(onOpened, 1200)
            }
            return next
        })
    }

    const shakeStyle = useAnimatedStyle(() => {
        const decay = 1 - shake.value
        const osc = Math.sin(shake.value * Math.PI * 6) * decay
        return {
            transform: [
                { translateX: osc * 12 },
                { rotate: `${osc * 8}deg` },
                { scaleX: 1 + osc * 0.14 },
                { scaleY: 1 - osc * 0.14 },
            ],
        }
    })

    return (
        <View style={styles.root}>
            <View style={styles.stage}>
                <Pressable onPress={onTap} disabled={isDoneAnimation} style={styles.pinataBox}>
                    <Animated.View style={[styles.pivot, shakeStyle]}>
                        <PinataBody hits={hits} />
                    </Animated.View>
                </Pressable>

                {chunks.map(c => (
                    <FlyingChunk key={c.id} id={c.id} points={c.points} onDone={removeChunk} />
                ))}
                {bursts.map(b => (
                    <ShardBurst key={b.id} id={b.id} count={b.count} onDone={removeBurst} />
                ))}
                {isDoneAnimation && <Confetti progress={confettiP} />}
            </View>

            <AppText
                style={styles.hint}
                rawText={translate('native.marketing.pinata.hit_the_pinata')}
                font="f20w400"
                brandColor="backgroundDefault"
                textAlign="center"
            />
        </View>
    )
}
