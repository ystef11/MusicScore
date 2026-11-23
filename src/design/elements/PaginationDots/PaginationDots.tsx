import { useMemo, memo } from 'react'
import { ViewStyle, StyleSheet } from 'react-native'
import Animated, { SharedValue } from 'react-native-reanimated'

import { layoutHelpers } from '../../helpers/layout'
import { style } from '../../helpers/style'
import PaginationDotItem from '../PaginationDotItem/PaginationDotItem'

const styles = StyleSheet.create({
    paginationDotsContainer: style.view({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
    }),
})

type TPaginationDotsProps = {
    length: number
    progressValue: SharedValue<number>
    backgroundColor: string
    customContainerStyle?: ViewStyle
    dotSize?: number
    customDotContainer?: ViewStyle
    isScaleDots?: boolean
    inactiveBgColorDots?: string
}

const PaginationDots = ({
    length,
    backgroundColor,
    progressValue,
    customContainerStyle = {},
    dotSize = layoutHelpers.getResponsiveSizeExtended(8),
    customDotContainer = {},
    isScaleDots = false,
    inactiveBgColorDots,
}: TPaginationDotsProps) => {
    const dots = useMemo(() => Array.from({ length }, (_, i: number) => i), [length])

    return (
        <Animated.View style={[styles.paginationDotsContainer, customContainerStyle]}>
            {!!dots?.length &&
                dots.map(item => (
                    <PaginationDotItem
                        dotSize={dotSize}
                        backgroundColor={backgroundColor}
                        animValue={progressValue}
                        index={item}
                        key={item}
                        length={dots.length}
                        customDotContainer={customDotContainer}
                        isScaleDots={isScaleDots}
                        inactiveBgColorDots={inactiveBgColorDots}
                    />
                ))}
        </Animated.View>
    )
}

export default memo(PaginationDots)
