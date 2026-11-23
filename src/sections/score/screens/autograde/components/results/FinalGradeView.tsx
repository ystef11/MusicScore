import React, { useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'

import { Circle, Path, Svg } from '@mu-native/ds'

import { getSvgEllipseArcPath, toRadians } from '../../helpers/svgHelpers.ts'

import { GradeStar } from './GradeStar.tsx'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    children: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
})

const StarMinGradeMap: Record<'1' | '2' | '3', number> = {
    '1': 70,
    '2': 80,
    '3': 90,
} as const

type StarIndex = keyof typeof StarMinGradeMap

const strokeWidth = 8
const viewBoxSize = 300
const radius = viewBoxSize / 2 - strokeWidth * 2
const centerX = viewBoxSize / 2
const centerY = viewBoxSize / 2

export const FinalGradeView = ({
    final,
    children,
}: {
    final: number
    children: React.ReactNode
}) => {
    const [layout, setLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
    const { width, height } = layout

    const size = Math.min(width, height)

    const onContainerLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => setLayout(layout)

    const outerArc = getSvgEllipseArcPath(
        centerX,
        centerY,
        radius,
        radius,
        toRadians(135),
        toRadians(270),
        0,
    )
    const innerArc = getSvgEllipseArcPath(
        centerX,
        centerY,
        radius,
        radius,
        toRadians(135),
        toRadians(270 * (final / 100)),
        0,
    )

    return (
        // @ts-ignore
        <View style={styles.container} onLayout={onContainerLayout}>
            {!!size && (
                // @ts-ignore
                <Svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                    fillOpacity={0}
                >
                    {/* @ts-ignore */}
                    <Path
                        d={outerArc}
                        stroke="white"
                        strokeOpacity={0.2}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* @ts-ignore */}
                    <Path
                        d={innerArc}
                        stroke="white"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                    {/* Dots along the arc representing min grade needed to achieve the corresponding star */}
                    {Object.keys(StarMinGradeMap).map((index: any) => {
                        // @ts-ignore
                        const angle = 135 + (StarMinGradeMap[index] / 100) * 270
                        const x = centerX + radius * Math.cos(toRadians(angle))
                        const y = centerX + radius * Math.sin(toRadians(angle))
                        return (
                            // @ts-ignore
                            <Circle
                                key={index}
                                cx={x}
                                cy={y}
                                r={6}
                                fill="#1CE0FF"
                                // @ts-ignore
                                fillOpacity={final >= StarMinGradeMap[index] ? 1 : 0}
                                strokeWidth={1}
                                stroke="white"
                            />
                        )
                    })}

                    {(Object.keys(StarMinGradeMap) as StarIndex[]).map(index => {
                        const angle = { 1: 65, 2: 90, 3: 115 }[index]
                        const minGrade = StarMinGradeMap[index]
                        return (
                            <GradeStar
                                key={index}
                                highlight={final >= minGrade}
                                centerX={centerX}
                                centerY={centerY}
                                radius={radius}
                                angle={angle}
                            />
                        )
                    })}
                </Svg>
            )}
            <View style={styles.children}>
                <View style={{ width: size, height: size, justifyContent: 'center' }}>
                    {children}
                </View>
            </View>
        </View>
    )
}
