import { StyleSheet, Text, View } from 'react-native'

import { translate } from '@mu-native/locale'

import {
    COLOR_GREY_400,
    COLOR_GREY_900,
    MARGIN_MD,
    MARGIN_SM,
    MARGIN_XS,
    MAX_TABLET_WIDTH,
} from '../constants/styles'

const styles = StyleSheet.create({
    container: {
        width: '95%',
        maxWidth: MAX_TABLET_WIDTH,
        alignSelf: 'center',
        paddingVertical: MARGIN_XS,
    },
    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: MARGIN_MD,
    },
    title: {
        color: COLOR_GREY_900,
        left: MARGIN_XS,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
    },
    count: {
        color: COLOR_GREY_400,
        marginLeft: MARGIN_SM,
        fontSize: 20,
    },
})

type Props = {
    title: string
    count?: number
}

const SectionHeader = ({ title, count }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text style={styles.title}>
                    {title}
                    {'\u00A0'}
                    {count && (
                        <Text style={styles.count}>
                            {count || translate('native.new_search.not_found')}
                        </Text>
                    )}
                </Text>
            </View>
        </View>
    )
}

export default SectionHeader
