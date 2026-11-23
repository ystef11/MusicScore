import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type TProps = {
    title: string
    subtitle?: string
    children: ReactNode
    isSubmitDisabled: boolean
    submitTestID: string
    onSubmit: () => void
}

export const NpsStep = ({
    title,
    subtitle,
    children,
    isSubmitDisabled,
    submitTestID,
    onSubmit,
}: TProps) => (
    <>
        <View style={styles.content}>
            <View style={styles.heading}>
                <AppText
                    font="f20w600"
                    lineHeight={24}
                    brandColor="contentPrimary"
                    rawText={title}
                />
                {subtitle ? (
                    <AppText
                        font="f15w400"
                        lineHeight={20}
                        brandColor="contentSecondary"
                        rawText={subtitle}
                    />
                ) : null}
            </View>
            {children}
        </View>
        <MuseButton
            type="primary"
            title={translate('native.nps.submit')}
            disabled={isSubmitDisabled}
            style={styles.button}
            testID={submitTestID}
            onPress={onSubmit}
        />
    </>
)

const styles = StyleSheet.create({
    content: {
        gap: 16,
        marginBottom: 32,
    },
    heading: {
        gap: 8,
    },
    button: {
        width: '100%',
    },
})
