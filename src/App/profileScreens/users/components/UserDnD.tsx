import React from 'react'
import {
    Image,
    ImageStyle,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'
import DraggableFlatList, {
    OpacityDecorator,
    RenderItemParams,
} from 'react-native-draggable-flatlist'

import { CommonTouchable, icons } from '@mu-native/ds'

import { TEXT_COLOR_900 } from '../../../constants/styles'
import { MSScoreT } from '../../../Model/MSScore'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        width: '100%',
        marginTop: 18,
    } as ViewStyle,
    contentContainer: {
        marginTop: 2,
        flex: 1,
    } as ViewStyle,
    label: {
        textAlign: 'left',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        marginHorizontal: 12,
        color: TEXT_COLOR_900,
        flexGrow: 1,
        flexShrink: 1,
    } as TextStyle,
    icon: {
        width: 24,
        height: 24,
        tintColor: TEXT_COLOR_900,
    } as ImageStyle,
    rowItem: {
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
})

type ScoreItemT = {
    scores: MSScoreT[]
    openRemoveModal: (item: MSScoreT) => void
    setScores: (scores: MSScoreT[]) => void
    ListHeaderComponent?: React.ReactElement
    style?: StyleProp<ViewStyle>
    containerStyle?: StyleProp<ViewStyle>
}

const UserDnD = ({
    scores,
    setScores,
    openRemoveModal = () => null,
    ListHeaderComponent,
    style,
    containerStyle,
}: ScoreItemT) => {
    const renderItem = ({ item, drag, isActive }: RenderItemParams<MSScoreT>) => {
        const { id, title } = item
        const onDelete = () => openRemoveModal(item)
        return (
            <OpacityDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    delayLongPress={250}
                    disabled={isActive}
                    style={styles.container}
                >
                    <View style={styles.rowItem}>
                        <Image source={icons.iconPositionArrow} style={styles.icon} />
                    </View>
                    <Text numberOfLines={1} style={styles.label}>
                        {title}
                    </Text>
                    <CommonTouchable onPress={onDelete}>
                        <Image source={icons.iconTrashSecond} style={styles.icon} />
                    </CommonTouchable>
                </TouchableOpacity>
            </OpacityDecorator>
        )
    }

    return (
        <DraggableFlatList
            data={scores}
            extraData
            showsVerticalScrollIndicator={false}
            onDragEnd={({ data }) => setScores(data)}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            keyExtractor={item => `${item.id}`}
            renderItem={renderItem}
            containerStyle={[styles.contentContainer, containerStyle]}
            style={style}
            ListHeaderComponent={ListHeaderComponent}
        />
    )
}

export default UserDnD
