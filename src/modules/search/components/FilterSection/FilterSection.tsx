import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, CommonTouchable, globalStyles } from '@mu-native/ds'

import { Chevron } from '../../elements/Chevron/Chevron'

type Props = {
    title: string
    isExpanded?: boolean
    children?: React.ReactNode
    onSectionPress?: () => void
    isChevronHidden?: boolean
    isLoading?: boolean
    testID?: string
}

export const FilterSectionTitle = memo(
    ({
        title,
        isExpanded = false,
        onSectionPress,
        isChevronHidden = false,
        testID,
    }: Pick<Props, 'title' | 'isExpanded' | 'onSectionPress' | 'isChevronHidden' | 'testID'>) => {
        return (
            <CommonTouchable
                testID={testID}
                onPress={onSectionPress}
                disabled={isChevronHidden}
                style={styles.container}
            >
                <AppText
                    style={globalStyles.flex1}
                    rawText={title}
                    font="f17w600"
                    brandColor="contentPrimary"
                />
                {!isChevronHidden && (
                    <View style={styles.rightSection}>
                        <Chevron expanded={isExpanded} hidden={isChevronHidden} />
                    </View>
                )}
            </CommonTouchable>
        )
    },
)

export const FilterSection = memo(
    ({
        title,
        children,
        isExpanded = false,
        onSectionPress,
        isChevronHidden = false,
        isLoading = false,
        testID,
    }: Props) => {
        return (
            <View
                pointerEvents={isLoading ? 'none' : 'auto'}
                style={isLoading ? styles.filterSectionWrapperLoadingState : undefined}
            >
                <FilterSectionTitle
                    title={title}
                    isExpanded={isExpanded}
                    isChevronHidden={isChevronHidden}
                    onSectionPress={onSectionPress}
                    testID={testID}
                />
                {isExpanded && children}
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
    },

    rightSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    filterSectionWrapperLoadingState: {
        opacity: 0.7,
    },
})
