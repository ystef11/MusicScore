import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText } from '../../components/AppText/AppText'
import { useSheetHorizontalInset } from '../../components/nativeBottomSheet/SheetInsetContext.tsx'
import { layout } from '../../constants/layout.ts'

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        lineHeight: 16,
        marginVertical: layout.marginMd,
    },
})

type TProps = {
    title: string
}

const ListSectionHeader = ({ title }: TProps) => {
    const inset = useSheetHorizontalInset()
    return (
        <AppText
            rawText={title}
            font="f13w400"
            brandColor="contentSecondary"
            style={[styles.title, { marginHorizontal: inset }]}
            textTransform="uppercase"
        />
    )
}

export default memo(ListSectionHeader)
