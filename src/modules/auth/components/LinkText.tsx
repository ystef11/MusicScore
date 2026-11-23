import { ReactNode } from 'react'
import { Linking, StyleSheet, Text } from 'react-native'

import { brandColors, colors } from '@mu-native/ds'

const styles = StyleSheet.create({
    link: { color: colors.blue600 },
    brandColor: { color: brandColors.colorActionPrimaryDefault },
})

const LinkText = ({
    children,
    url,
    isRebrandingStyle = true,
}: {
    children: ReactNode
    url: string
    isRebrandingStyle: boolean
}) => {
    const onPress = async () => {
        if (await Linking.canOpenURL(url)) {
            await Linking.openURL(url)
        }
    }
    return (
        <Text onPress={onPress} style={[styles.link, isRebrandingStyle && styles.brandColor]}>
            {children}
        </Text>
    )
}

export default LinkText
