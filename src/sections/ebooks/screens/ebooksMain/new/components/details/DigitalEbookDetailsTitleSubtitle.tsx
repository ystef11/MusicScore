import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { AppText } from '@mu-native/ds'

import { DigitalEbookModel } from '../../api/digital.ebooks.models'

type TProps = {
    style?: StyleProp<ViewStyle>
    textAlign?: 'left' | 'center'
    name: DigitalEbookModel['name']
    artistOrComposer?: string
}

export const DigitalEbookDetailsTitleSubtitle = ({
    style,
    textAlign,
    name,
    artistOrComposer,
}: TProps) => {
    return (
        <View testID={songbookTestIds.detailsTitle} style={style}>
            <AppText rawText={name} textAlign={textAlign ?? 'center'} font="f44w400Accent" />
            {!!artistOrComposer && (
                <AppText
                    brandColor="contentSecondary"
                    rawText={artistOrComposer}
                    textAlign={textAlign ?? 'center'}
                    style={styles.subtitle}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    subtitle: {
        marginTop: 4,
    },
})
