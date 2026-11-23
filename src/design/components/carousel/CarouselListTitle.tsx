import { memo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { chevronRight } from '@mu-native/icons/chevronRight'

import { brandColors } from '../../constants/new/brandColors.ts'
import { CommonTouchable } from '../../elements/CommonTouchable.tsx'
import { AppText } from '../AppText/AppText'
import Icon from '../Icon/Icon'

type TCarouselTitleProps = {
    readonly text: string
    readonly style?: StyleProp<ViewStyle>
    readonly onPress?: () => void
    readonly testID?: string
}
export const CarouselListTitle = memo(({ text, style, onPress, testID }: TCarouselTitleProps) => {
    return (
        <CommonTouchable
            style={[!!onPress && styles.titleContainer, style]}
            onPress={onPress}
            testID={testID}
        >
            <AppText font="f20w600" rawText={text} adaptiveSize />
            {!!onPress && (
                <Icon source={chevronRight} size={24} tint={brandColors.contentSecondary} />
            )}
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
})
