import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { globalStyles } from '../constants/layout.ts'
import { BrandThemeColorKey } from '../constants/new/brandColors.ts'
import { BrandsThemeFontKey } from '../constants/new/fonts.ts'
import { BrandAppLoader } from '../elements/BrandAppLoader/BrandAppLoader'
import { Checkbox } from '../elements/Checkbox/Checkbox'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

import { AppText } from './AppText/AppText'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: 8,
    },

    loading: {
        width: 24,
        height: 24,
    },
})

type EmailCheckboxType = {
    title: string
    selected: boolean
    onToggle: () => void
    isLoading?: boolean
    font?: BrandsThemeFontKey
    brandColor?: BrandThemeColorKey
}

export const BrandCheckboxWithTitle = memo(
    ({
        title,
        selected,
        onToggle,
        font = 'f17w400',
        isLoading,
        brandColor = 'contentPrimary',
    }: EmailCheckboxType) => (
        <CommonTouchable onPress={isLoading ? undefined : onToggle} style={styles.container}>
            {!isLoading && <Checkbox selected={selected} />}
            {isLoading && <BrandAppLoader size="s" style={styles.loading} />}
            <AppText
                style={globalStyles.flex1}
                brandColor={brandColor}
                adaptiveSize
                font={font}
                rawText={title}
            />
        </CommonTouchable>
    ),
)
