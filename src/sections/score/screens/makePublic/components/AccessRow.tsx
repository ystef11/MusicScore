import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import { BrandBaseListCell, brandColors, Divider, Icon, layout } from '@mu-native/ds'
import { chevronRight } from '@mu-native/icons/chevronRight'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import { type ScorePrivacyValue } from '../../../../../App/Model/MSScore'
import { getAccessOptions } from '../constants.ts'

type Props = {
    access: ScorePrivacyValue
}

export const AccessRow = memo(({ access }: Props) => {
    const navigation = useAppNavigation()
    const label = getAccessOptions().find(o => o.key === access)?.label ?? ''

    const onPress = useCallback(() => {
        navigation.navigate(Screen.makePublicManageAccess)
    }, [navigation])

    return (
        <>
            <BrandBaseListCell
                title={label}
                subtitle={translate('native.make_public.manage_access')}
                rightComponent={
                    <Icon source={chevronRight} size={24} tint={brandColors.contentPrimary} />
                }
                onPress={onPress}
                style={styles.container}
            />
            <Divider style={styles.divider} />
        </>
    )
})

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginMd,
    },
    divider: {
        marginVertical: layout.marginMd,
    },
})
