import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout } from '@mu-native/ds'

import { UserInfoT } from '../../userTypes.ts'
import FollowersCountColumn from '../followersCountColumn/FollowersCountColumn'

type Props = {
    userProfileInfo: UserInfoT | null | undefined
    followersElement: {
        scores: string
        counterName: string
        columnName: string
        onPress: () => void
    }[]
}

const UserFollowersElement = ({ userProfileInfo, followersElement }: Props) => {
    followersElement = followersElement ?? []
    return (
        <View style={styles.container}>
            {followersElement.map(item => {
                let score = item.scores
                if (item.counterName === 'followersCount') {
                    score = userProfileInfo?.followersCount.toString() ?? ''
                }
                if (item.counterName === 'followingsCount') {
                    score = userProfileInfo?.followingsCount.toString() ?? ''
                }
                const isZeroCount = item.counterName && score === '0'
                return (
                    <FollowersCountColumn
                        key={item.columnName}
                        scores={score}
                        columnName={item.columnName}
                        onPress={isZeroCount ? undefined : item.onPress}
                        isLoading={!userProfileInfo}
                    />
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: layout.marginMd,
        paddingBottom: 24,
        paddingTop: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
})

export default memo(UserFollowersElement)
