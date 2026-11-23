import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { AppText, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { RestorePurchasesCheckingRow } from './RestorePurchasesCheckingRow'

type TProps = {
    isRestoring: boolean
    onRestorePress: () => void
}

const getRestorePromptParts = () => {
    const [before = '', rest = ''] = translate(
        'native.orders.restore_purchase_prompt_with_link',
    ).split('[a]')
    const [link = '', after = ''] = rest.split('[/a]')

    return { before, link, after }
}

/**
 * "Something missing? Restore purchase." row rendered after the purchased
 * scores list (MUP-13968); swaps to the checking loader while restoring.
 */
export const RestorePurchasesFooter = memo(({ isRestoring, onRestorePress }: TProps) => {
    const prompt = getRestorePromptParts()

    return (
        <View style={styles.container}>
            {isRestoring ? (
                <RestorePurchasesCheckingRow />
            ) : (
                <AppText font="f15w400" brandColor="contentSecondary">
                    {prompt.before}
                    <AppText
                        font="f15w600"
                        brandColor="contentPrimary"
                        decorationLine="underline"
                        onPress={onRestorePress}
                        testID={libraryTestIds.components.restorePurchaseLink}
                    >
                        {prompt.link}
                    </AppText>
                    {prompt.after}
                </AppText>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingVertical: layout.marginSm,
    },
})
