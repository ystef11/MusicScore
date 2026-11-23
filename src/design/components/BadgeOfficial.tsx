import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { translate } from '@mu-native/locale'

import { AppBadge } from './AppBadge.tsx'

export const BadgeOfficial = memo(() => (
    <AppBadge
        title={translate('native.official')}
        backgroundColor="additionalDefaultSubdued"
        textColor="additionalDefault"
        style={styles.badge}
    />
))

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
    },
})
