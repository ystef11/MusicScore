import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, layoutHelpers, SvgAsset } from '@mu-native/ds'

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: brandColors.contentPrimary,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
        paddingVertical: 130,
    },
    firstTrianglePosition: { position: 'absolute', top: -16, left: 0 },
    secondTrianglePosition: {
        position: 'absolute',
        bottom: -16,
        right: 0,
        transform: [{ rotate: '180deg' }],
    },
    maxTitleWidth: { maxWidth: '90%', alignSelf: 'center' },
})

const bgColorsByIndex = {
    577: brandColors.contentPrimary,
    580: brandColors.additionalBeginner,
    583: brandColors.additionalAdvanced,
    586: brandColors.colorCyan900,
}

const bgColorsByIndexC = {
    604: brandColors.contentPrimary,
    607: brandColors.additionalBeginner,
    610: brandColors.additionalAdvanced,
    613: brandColors.colorCyan900,
}

export const CardQuestion = ({
    title = '',
    quizId,
    backgroundColor,
}: {
    title?: string
    quizId: number
    backgroundColor?: string
}) => {
    return (
        <View
            style={[
                styles.cardContainer,
                {
                    backgroundColor:
                        backgroundColor ||
                        bgColorsByIndex[quizId as keyof typeof bgColorsByIndex] ||
                        bgColorsByIndexC[quizId as keyof typeof bgColorsByIndexC] ||
                        brandColors.contentPrimary,
                },
            ]}
        >
            <AppText
                font="f24w600"
                textAlign="center"
                rawText={title}
                adaptiveSize
                brandColor="backgroundDefault"
                style={styles.maxTitleWidth}
            />
            <View style={styles.firstTrianglePosition}>
                <SvgAsset type="triangle_group" />
            </View>
            <View style={styles.secondTrianglePosition}>
                <SvgAsset type="triangle_group" />
            </View>
        </View>
    )
}
