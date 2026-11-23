import { StyleSheet, View, Image, Text } from 'react-native'

import { CommonTouchable, icons } from '@mu-native/ds'

import {
    MARGIN_XM,
    MARGIN_XS,
    MARGIN_SM,
    COLOR_LINK,
    COLOR_SILVER,
    COLOR_SILVER_DEEP,
} from '../../../constants/styles'
import MSScore, { getInstrumentTitle } from '../../../Model/MSScore'
import { isTablet } from '../../../Utils/Platform'

const styles = StyleSheet.create({
    container: {
        marginTop: MARGIN_XM,
        flexDirection: 'row',
        width: '100%',
    },
    topContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopColor: COLOR_SILVER,
        borderTopWidth: 1,
        paddingTop: MARGIN_SM,
        marginTop: MARGIN_XM,
    },
    descContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        lineHeight: 21,
        color: COLOR_LINK,
    },
    text: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: MARGIN_XS / 2,
        color: COLOR_SILVER_DEEP,
    },
    iconWithCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        tintColor: COLOR_SILVER_DEEP,
        marginHorizontal: MARGIN_SM,
        maxWidth: 16,
    },
    previewContainer: {
        height: 96,
        width: 144,
        overflow: 'hidden',
    },
    preview: {
        width: '100%',
        aspectRatio: 2 / 3,
    },
    contentContainer: {
        marginLeft: MARGIN_XM,
        flex: 1,
    },
})

function formatHits(score: MSScore) {
    const ONE_BILLION = 1000000
    const ONE_THOUSAND = 1000

    if (score.hits >= ONE_BILLION) {
        return `${Math.floor(score.hits / ONE_BILLION)}M`
    }

    if (score.hits >= ONE_THOUSAND) {
        return `${Math.floor(score.hits / ONE_THOUSAND)}K`
    }

    return score.hits
}

const IconWithCount = ({ source, count }: { source: { uri: string }; count: string | number }) => (
    <View style={styles.iconWithCountContainer}>
        <Image source={source} style={styles.icon} resizeMode="contain" />
        <Text style={styles.text}>{count.toString()}</Text>
    </View>
)

const FeedScoreInfo = ({
    item,
    openScore,
}: {
    item: { data: { score: MSScore } }
    openScore: () => void
}) => {
    const { score } = item.data
    const scoreInstruments = score?.instruments || []
    const instruments = scoreInstruments.map(item => getInstrumentTitle(item)).join(', ')

    return (
        <CommonTouchable onPress={openScore}>
            <View style={styles.container}>
                <View style={styles.previewContainer}>
                    {score.previewImageUrl && (
                        <Image
                            style={styles.preview}
                            source={{ uri: score.previewImageUrl }}
                            resizeMode="cover"
                        />
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.topContainer}>
                        <View style={styles.descContainer}>
                            <View>
                                <Text style={styles.title}>{score?.title}</Text>
                                <Text style={styles.text}>{instruments}</Text>
                            </View>
                            {isTablet ? (
                                <View style={styles.bottomContainer}>
                                    {!!score?.hits && (
                                        <IconWithCount
                                            count={formatHits(score)}
                                            source={icons.eye}
                                        />
                                    )}
                                    <IconWithCount
                                        count={score?.commentsCount}
                                        source={icons.message}
                                    />
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {!isTablet ? (
                        <View style={styles.bottomContainer}>
                            {!!score?.hits && (
                                <IconWithCount count={formatHits(score)} source={icons.eye} />
                            )}
                            {!!score?.commentsCount && (
                                <IconWithCount
                                    count={score?.commentsCount}
                                    source={icons.message}
                                />
                            )}
                        </View>
                    ) : null}
                </View>
            </View>
        </CommonTouchable>
    )
}

export default FeedScoreInfo
