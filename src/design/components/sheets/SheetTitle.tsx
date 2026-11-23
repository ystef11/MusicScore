import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText } from '../AppText/AppText'
import { useSheetHorizontalInset } from '../nativeBottomSheet/SheetInsetContext.tsx'

type TProps = {
    title: string
    subtitle?: string
    align?: 'left' | 'center'
    titleTestID?: string
}

export const SheetTitle = memo((props: TProps) => {
    const inset = useSheetHorizontalInset()
    return (
        <>
            <AppText
                nativeID="BottomSheetHeader-title"
                testID={props.titleTestID}
                rawText={props.title}
                font="f44w400Accent"
                lineHeight={44}
                textAlign={props.align ?? 'center'}
            />
            {!!props.subtitle && (
                <AppText
                    rawText={props.subtitle}
                    font="f15w400"
                    brandColor="contentSecondary"
                    style={[styles.subtitle, { paddingHorizontal: inset }]}
                    textAlign={props.align ?? 'center'}
                />
            )}
        </>
    )
})
SheetTitle.displayName = 'SheetTitle'

const styles = StyleSheet.create({
    subtitle: {
        marginTop: 8,
    },
})
