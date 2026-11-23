import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { platform } from '@mu-native/common'
import { brandColors, brandFontsStyles, CommonTouchable, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { searchStoreChunk } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import { exploreScoreListStoreChunk } from '../exploreScoreListStoreChunk.ts'

import { screenExploreThunks } from './thunks/thunks.ts'

const SPLIT_MARKER = '__SPLIT__'

const insertAtMarker = (message: string, node: string) =>
    message.split(SPLIT_MARKER).flatMap((part, index) =>
        index === 0
            ? [part]
            : [
                  <Text key={index} style={styles.tdu}>
                      {node}
                  </Text>,
                  part,
              ],
    )

export const CorrectQueryView = memo(() => {
    const [correctedQuery, searchTerm] = useValues([
        exploreScoreListStoreChunk.props.getCorrectedQuery,
        searchStoreChunk.props.getSearchTerm,
    ])
    const actions = useActions({
        search: screenExploreThunks.search,
        setCorrectedQuery: exploreScoreListStoreChunk.actions.setCorrectedQuery,
    })

    if (!correctedQuery) return null

    let rawTitle = translate('native.typo_search.title', { result: SPLIT_MARKER })

    let rawDescription = translate('native.typo_search.description', { result: SPLIT_MARKER })

    if (platform.isTablet) {
        rawTitle = rawTitle.replace('\n', ' ')
        rawDescription = rawDescription.replace('\n', ' ')
    }

    const title = insertAtMarker(rawTitle, correctedQuery)
    const description = insertAtMarker(rawDescription, searchTerm)

    return (
        <View style={styles.base}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.topText}>
                {title}
            </Text>

            <CommonTouchable
                onPress={() => {
                    actions.search(exploreScoreListStoreChunk, searchTerm, true)
                    actions.setCorrectedQuery('')
                }}
            >
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bottomText}>
                    {description}
                </Text>
            </CommonTouchable>
        </View>
    )
})
CorrectQueryView.displayName = 'CorrectQueryView'

const styles = StyleSheet.create({
    base: {
        height: 84,
        justifyContent: 'center',
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: 20,
    },

    topText: {
        color: brandColors.contentPrimary,
        ...brandFontsStyles.f20w600,
    },

    bottomText: {
        color: brandColors.contentSecondary,
        ...brandFontsStyles.f14w400,
        marginTop: 16,
    },

    tdu: {
        textDecorationLine: 'underline',
    },
})
