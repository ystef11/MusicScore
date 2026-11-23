import { StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    IconSource,
} from '@mu-native/ds'
import { chevronRight } from '@mu-native/icons/chevronRight'

type TLabelProps = {
    count?: number
}

type TProps = {
    icon?: IconSource
    testID: string
    title: string
    text?: string
    count?: number
    onPress: () => void
}

const Label = ({ count }: TLabelProps) => {
    if (!count) return null
    return <AppText font="f13w400" brandColor="contentSecondary" rawText={count.toString()} />
}

export const LibraryListElement = ({ title, text, count, onPress, testID, icon }: TProps) => {
    const containerStyle = styles.newContainer
    return (
        <CommonTouchable testID={testID} onPress={onPress} style={containerStyle}>
            <View style={styles.leftBlock}>
                {!!icon && <Icon source={icon} />}
                <View style={styles.textBlock}>
                    <AppText font="f15w500" rawText={title} />
                    {!!text && (
                        <AppText
                            font="f13w400"
                            numberOfLines={2}
                            rawText={text}
                            brandColor="contentSecondary"
                        />
                    )}
                </View>
            </View>
            <View style={styles.rightBlock}>
                <Label count={count} />
                <Icon source={chevronRight} size={24} tint={brandColors.contentSecondary} />
            </View>
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    newContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    leftBlock: {
        flex: 1,
        flexDirection: 'row',
    },
    rightBlock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textBlock: {
        flex: 1,
        marginLeft: 14,
        paddingRight: 8,
    },
})
