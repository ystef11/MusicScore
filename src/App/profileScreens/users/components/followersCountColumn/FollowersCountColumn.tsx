import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, CommonTouchable, BrandAppLoader } from '@mu-native/ds'

type TFollowers = {
    scores: string
    onPress?: () => void
    columnName: string
    isLoading: boolean
}

const FollowersCountColumn = ({ scores, onPress, columnName, isLoading }: TFollowers) => {
    return (
        <CommonTouchable onPress={onPress} style={styles.column}>
            {!isLoading ? (
                <AppText font="f20w600" brandColor="contentPrimary">
                    {scores}
                </AppText>
            ) : (
                <BrandAppLoader size="s" />
            )}
            <AppText font="f11w400" lineHeight={12} brandColor="contentSecondary" style={styles.columnNameStyle}>
                {columnName}
            </AppText>
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    column: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    columnNameStyle: {
        marginHorizontal: 16,
    },
})

export default memo(FollowersCountColumn)
