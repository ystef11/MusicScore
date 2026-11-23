import React from 'react'
import { Linking, ScrollView, StyleSheet, Text } from 'react-native'

import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_DEEP_BLUE } from '../../constants/styles'
import EmptyList from '../../Elements/emptyList/EmptyList'
import LinkButton from '../../Elements/LinkButton'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },

    title: {
        fontSize: 16,
        lineHeight: 20,
        textAlign: 'center',
        color: COLOR_DEEP_BLUE,
    },
})

interface Props {
    readonly isSearching: boolean
}

const EmptyMyScoresList: React.FC<Props> = ({ isSearching }) => {
    const openLink = async (link: string) => {
        const canOpenLink = await Linking.canOpenURL(link)

        if (canOpenLink) {
            await Linking.openURL(link)
        }
    }

    const openSiteLink = () => {
        const UPLOAD_LINK = 'https://musescore.com/'
        openLink(UPLOAD_LINK)
    }

    const openEditorLink = () => {
        const EDITOR_LINK = 'https://musescore.org/'
        openLink(EDITOR_LINK)
    }

    if (isSearching) {
        return <Text style={styles.title}>{translate('native.search.empty')}</Text>
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <EmptyList
                icon={icons.myScoresIcon}
                heading={translate('native.library.my_scores.title')}
                subscription={translate('native.library.my_scores.desc')}
            />
            <LinkButton
                text={translate('native.library.my_scores.site_link')}
                onPress={openSiteLink}
                underline
            />
            <LinkButton
                text={translate('native.library.my_scores.editor_link')}
                onPress={openEditorLink}
                underline
            />
        </ScrollView>
    )
}

export default EmptyMyScoresList
