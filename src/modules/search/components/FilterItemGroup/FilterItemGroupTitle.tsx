import { StyleSheet, View } from 'react-native'

import { AppText, CommonTouchable, globalStyles } from '@mu-native/ds'

import { Chevron } from '../../elements/Chevron/Chevron.tsx'

type Props = {
    title: string
    isExpanded: boolean
    onPress: () => void
    count?: string
    testID?: string
    nestingLevel?: 0 | 1
}

export const FilterItemGroupTitle = ({
    count,
    testID,
    onPress,
    title,
    isExpanded,
    nestingLevel = 0,
}: Props) => {
    return (
        <CommonTouchable
            testID={testID}
            style={[styles.item, nestingLevel === 1 && styles.nestedItem]}
            onPress={onPress}
        >
            <View style={styles.leftSection}>
                <Chevron expanded={isExpanded} hidden={false} defaultState="right" />
            </View>
            <AppText
                font="f17w400"
                rawText={title}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={globalStyles.flexShrink}
                brandColor="contentPrimary"
            />
            {!!count && (
                <AppText
                    rawText={count?.toString()}
                    brandColor="contentTertiary"
                    font="f17w400"
                    style={styles.count}
                />
            )}
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    item: {
        height: 48,
        borderRadius: 32 / 2,
        alignItems: 'center',
        flexDirection: 'row',
    },
    leftSection: {
        marginEnd: 8,
    },
    count: {
        marginStart: 3,
    },
    nestedItem: {
        marginLeft: 30,
    },
})
