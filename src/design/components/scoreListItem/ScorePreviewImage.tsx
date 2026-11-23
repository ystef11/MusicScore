import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { noteList } from '@mu-native/icons/noteList'

import { brandColors } from '../../constants/new/brandColors.ts'
import { TPurchasedStore } from '../BadgePurchasedStore'
import Icon from '../Icon/Icon'

import { BadgeElements } from './BadgeElements'

function isOnlineUrl(url: string) {
    const reg = /^https|^http/
    return reg.exec(url)
}

type Props = {
    url?: string | null
    isOfficial?: boolean
    /** SMP/SMD purchase badge; replaces "Official" when both apply (MUP-13968). */
    purchaseSource?: TPurchasedStore | null
    original?: boolean
    blocked?: boolean
    size?: StyleProp<ViewStyle>
    complexity?: 0 | 1 | 2 | 3
    privacy?: number
    /**
     * Show the whole page instead of the top-cropped square thumbnail.
     * Uses `contain` so an A4 page is not clipped (Score Info preview).
     */
    fullPage?: boolean
}

const Overlay = ({ blocked }: Pick<Props, 'blocked'>) => {
    return (
        <View
            style={[
                styles.colorPreview,
                { backgroundColor: blocked ? brandColors.strokeDefault : undefined },
            ]}
        />
    )
}

export const ScorePreviewImage = ({
    url,
    isOfficial,
    purchaseSource,
    original,
    blocked = false,
    size,
    complexity,
    privacy,
    fullPage = false,
}: Props) => {
    let source: { uri: string } | null = null

    if (url && isOnlineUrl(url)) {
        source = { uri: url.replace('@180', '@720') }
    }

    const defaultPreview = !source
    // eslint-disable-next-line no-nested-ternary
    const containerStyle: ViewStyle = {
        justifyContent: fullPage || defaultPreview ? 'center' : 'flex-start',
        ...(fullPage ? { backgroundColor: brandColors.backgroundDefault } : null),
    }
    const previewStyle = styles.previewContainer2

    return (
        <View style={[previewStyle, containerStyle, size]}>
            {!!source && (
                <Image
                    style={fullPage ? styles.previewFull : styles.preview2}
                    source={source}
                    resizeMode="cover"
                />
            )}
            {!source && (
                <Icon source={noteList} tint={brandColors.contentInactive} style={styles.icon} />
            )}
            <Overlay blocked={blocked} />
            <BadgeElements
                isOfficial={isOfficial}
                purchaseSource={purchaseSource}
                original={original}
                complexity={complexity}
                privacy={privacy}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    colorPreview: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
    },
    previewContainer2: {
        width: 132,
        height: 132,
        overflow: 'hidden',
        borderRadius: 1,
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
    },
    preview2: {
        width: '100%',
        height: '130%',
        overflow: 'hidden',
        marginTop: 10,
    },
    previewFull: {
        width: '100%',
        height: '100%',
    },

    icon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})
