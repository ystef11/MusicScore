import { memo } from 'react'
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import formatDate from '../../../../../../../App/Utils/Date'
import { DigitalEbookModelFull } from '../../api/digital.ebooks.models'

type TProps = {
    style?: StyleProp<ViewStyle>
    ebook: DigitalEbookModelFull
}

type TInfoProps = {
    readonly title: string
    readonly subtitle?: string
    readonly value?: string | number
}

const Separator = () => {
    return <View style={styles.separator} />
}

export const InformationItem = ({ title, subtitle, value }: TInfoProps) => {
    return (
        <View style={styles.item}>
            <AppText
                rawText={title}
                brandColor="contentSecondary"
                font="f11w500"
                textTransform="uppercase"
            />
            {!!value && <AppText rawText={value.toString()} font="f17w500" />}
            {!!subtitle && <AppText rawText={subtitle} font="f11w400" />}
        </View>
    )
}

export const DigitalEbookDetailsInformation = memo(({ style, ebook }: TProps) => {
    const released = ebook.release_date ? new Date(Number(ebook.release_date) * 1000) : undefined
    const instruments = ebook.instruments.join(', ')
    const topics = ebook.topics.join(', ')

    return (
        <ScrollView
            testID={songbookTestIds.detailsInformation}
            style={style}
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={styles.contentContainer}
        >
            {!!released && (
                <>
                    <InformationItem
                        title={translate('native.ebooks.info.released')}
                        value={released.getFullYear()}
                        subtitle={formatDate(released, 'DD MMMM')}
                    />
                    <Separator />
                </>
            )}
            {!!ebook.length && (
                <>
                    <InformationItem
                        title={translate('native.ebooks.info.length')}
                        value={ebook.length}
                        subtitle={translate('native.ebooks.pages_count_label', {
                            count: ebook.length,
                        })}
                    />
                    <Separator />
                </>
            )}
            {!!instruments && (
                <>
                    <InformationItem
                        title={translate('native.courses.instrument')}
                        value={instruments}
                    />
                    <Separator />
                </>
            )}
            {!!topics && (
                <>
                    <InformationItem title={translate('native.ebooks.topics')} value={topics} />
                    <Separator />
                </>
            )}
            {!!ebook.publisher && !!ebook.publisher.name && (
                <>
                    <InformationItem
                        title={translate('native.ebooks.info.publisher')}
                        value={ebook.publisher.name}
                    />
                    <Separator />
                </>
            )}
            {!!ebook.isbn10 && (
                <>
                    <InformationItem title={translate('native.ebooks.isbn')} value={ebook.isbn10} />
                    <Separator />
                </>
            )}

            {!!ebook.artist_or_composer && (
                <InformationItem
                    title={translate('native.ebooks.info.composers')}
                    value={ebook.artist_or_composer}
                />
            )}
        </ScrollView>
    )
})
const styles = StyleSheet.create({
    contentContainer: {
        gap: 28,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    item: {
        alignItems: 'center',
        gap: 4,
    },

    separator: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: brandColors.contentPrimary,
        opacity: 0.1,
        height: '100%',
    },
})
