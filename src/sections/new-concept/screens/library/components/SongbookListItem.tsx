import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, FastImage, layout } from '@mu-native/ds'

import type { DigitalEbookModel } from '../../../../ebooks/screens/ebooksMain/new/api/digital.ebooks.models'

type TProps = {
    ebook: DigitalEbookModel
    subtitle?: string
    onPress: (ebook: DigitalEbookModel) => void
    testID?: string
}

export const SongbookListItem = ({ ebook, subtitle, onPress, testID }: TProps) => (
    <CommonTouchable onPress={() => onPress(ebook)} style={styles.container} testID={testID}>
        <FastImage
            style={styles.cover}
            source={ebook.image_cover_url ? { uri: ebook.image_cover_url } : undefined}
            resizeMode="cover"
        />
        <View style={styles.info}>
            <AppText font="f15w500" numberOfLines={2} rawText={ebook.name} />
            {!!subtitle && (
                <AppText
                    font="f13w400"
                    brandColor="contentSecondary"
                    numberOfLines={1}
                    rawText={subtitle}
                    style={styles.subtitle}
                />
            )}
        </View>
    </CommonTouchable>
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: layout.marginMd,
    },
    cover: {
        width: 80,
        height: 104,
        borderRadius: 1,
        backgroundColor: brandColors.backgroundInactive,
    },
    info: {
        flex: 1,
        gap: layout.marginXs,
    },
    subtitle: {
        marginTop: 2,
    },
})
