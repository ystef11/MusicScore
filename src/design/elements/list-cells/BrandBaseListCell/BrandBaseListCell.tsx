import { memo, useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '../../../components/AppText/AppText'
import { useSheetHorizontalInset } from '../../../components/nativeBottomSheet/SheetInsetContext.tsx'
import { TBaseListCellProps } from '../../../types/listCellTypes'

export const BrandBaseListCell = memo(
    ({ title, subtitle, rightComponent, style, onPress }: TBaseListCellProps) => {
        const inset = useSheetHorizontalInset()
        const containerStyles = useMemo(() => {
            return StyleSheet.flatten([
                styles.container,
                { paddingHorizontal: inset },
                !subtitle && styles.verticallyCenteredContainer,
                style,
            ])
        }, [style, subtitle, inset])

        const Container = onPress ? Pressable : View

        return (
            <Container style={containerStyles} onPress={onPress}>
                <View style={styles.titleWrapper}>
                    <AppText font="f17w400" rawText={title} />
                    {!!subtitle && (
                        <AppText brandColor="contentSecondary" font="f13w400" rawText={subtitle} />
                    )}
                </View>
                {rightComponent}
            </Container>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        justifyContent: 'center',
    },
    verticallyCenteredContainer: {
        alignItems: 'center',
    },

    titleWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
})
