import { memo, useCallback } from 'react'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { globalStyles, MuseButton } from '@mu-native/ds'
import { heartFilled } from '@mu-native/icons/heartFilled'
import { heartOutlined } from '@mu-native/icons/heartOutlined'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

export const DigitalEbookToggleFavoriteButton = memo(() => {
    const chunk = useDigitalEbookDetailsChunk()
    const [isFavorite, isUpdating, isAuthorized] = useValues([
        chunk.props.getIsFavorite,
        chunk.props.getIsUpdatingFavorite,
        getIsAuthorized,
    ])
    const actions = useActions({
        toggleFavorite: digitalEbooksThunk.toggleFavorite,
        presentAuth: authStoreChunk.actions.presentAuthModal,
    })

    const onTogglePress = useCallback(() => {
        if (isAuthorized) {
            actions.toggleFavorite(chunk)
            return
        }
        actions.presentAuth(() => {
            actions.toggleFavorite(chunk)
        })
    }, [actions, chunk, isAuthorized])

    return (
        <MuseButton
            haptic
            testID={songbookTestIds.detailsFavoriteButton}
            type="secondary"
            title={translate('native.score_details_sheet.favorite_button')}
            startIcon={isFavorite ? heartFilled : heartOutlined}
            isLoading={isUpdating}
            onPress={onTogglePress}
            style={globalStyles.flex1}
        />
    )
})
