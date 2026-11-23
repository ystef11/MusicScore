import { useRef } from 'react'
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native'
import { useAnimatedRef } from 'react-native-reanimated'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { colors, useBindTopBarScroll, useTopBarHeight } from '@mu-native/ds'
import { ProfileOnBoardingComponent, UpgradeOnBoarding } from '@mu-native/marketing'
import { useValues } from '@ug/store'

import NoAuthBlock from '../../Elements/noAuthBlock/NoAuthBlock'
import ProfileTabsComponent from '../components/ProfileTabsComponent.tsx'

import { AuthorizedUserProfileContainer } from './containers/AuthorizedUserProfileContainer.tsx'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.white,
    },
    space: {
        height: 10,
    },
    flexGrow: {
        flexGrow: 1,
        paddingBottom: 20,
    },
})

export const ProfileScreenContainer = () => {
    const [isAuthorized, user] = useValues([getIsAuthorized, authStoreChunk.props.getUser])

    const scrollViewRef = useAnimatedRef<ScrollView>()
    useBindTopBarScroll(scrollViewRef)
    const topBarHeight = useTopBarHeight()
    const tabPositionYRef = useRef(0)

    const onLayoutTabComponent = ({ nativeEvent }: LayoutChangeEvent) => {
        tabPositionYRef.current = nativeEvent.layout.y - topBarHeight
    }

    return (
        <>
            <ScrollView
                ref={scrollViewRef}
                testID="Profile parent scroll view"
                style={styles.container}
                contentContainerStyle={[styles.flexGrow, { paddingTop: topBarHeight }]}
            >
                {!isAuthorized && <View style={styles.space} />}
                {isAuthorized && !!user?.id && <AuthorizedUserProfileContainer userId={user.id} />}
                <ProfileOnBoardingComponent />
                {!isAuthorized && <View style={styles.space} />}
                <UpgradeOnBoarding />
                <View onLayout={onLayoutTabComponent}>
                    <ProfileTabsComponent ref={scrollViewRef} tabPositionYRef={tabPositionYRef} />
                </View>
            </ScrollView>
            {!isAuthorized && <NoAuthBlock />}
        </>
    )
}
