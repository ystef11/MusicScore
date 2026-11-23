import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import { BrandBaseListCell, brandColors, Divider, Icon, layout } from '@mu-native/ds'
import { chevronRight } from '@mu-native/icons/chevronRight'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import { getCopyrightOptions, type CopyrightOption } from '../constants.ts'

type Props = {
    copyright: CopyrightOption
}

export const CopyrightRow = memo(({ copyright }: Props) => {
    const navigation = useAppNavigation()
    const label = getCopyrightOptions().find(o => o.key === copyright)?.label ?? ''

    const onPress = useCallback(() => {
        navigation.navigate(Screen.makePublicCopyright)
    }, [navigation])

    return (
        <>
            <Divider style={styles.divider} />
            <BrandBaseListCell
                title={label}
                subtitle={translate('native.make_public.copyright_settings')}
                rightComponent={
                    <Icon source={chevronRight} size={24} tint={brandColors.contentPrimary} />
                }
                onPress={onPress}
            />
        </>
    )
})

const styles = StyleSheet.create({
    divider: {
        marginVertical: layout.marginMd,
    },
})
