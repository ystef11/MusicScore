import { StyleSheet, View } from 'react-native'

import { brandColors, layout, TopBarScrollDisabler } from '@mu-native/ds'
import { EbooksMainScreen } from '@mu-native/ebooks-main-screen'
import { translate } from '@mu-native/locale'
import { NestedScreenHeader, useScreenViewReporter } from '@mu-native/new-concept-shared'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'

export const SongbooksScreen = () => {
    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_SONGBOOKS_VIEW)

    return (
        <View style={styles.root}>
            <TopBarScrollDisabler>
                <EbooksMainScreen searchBarStyle={styles.searchBar} />
                <View style={styles.headerOverlay}>
                    <NestedScreenHeader title={translate('native.bottom_bar.books_tab')} />
                </View>
            </TopBarScrollDisabler>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    // The reused search bar carries paddingTop 23 for the legacy tab header;
    // under the nested title row it sits much closer.
    searchBar: {
        paddingTop: layout.marginSm,
    },
})
