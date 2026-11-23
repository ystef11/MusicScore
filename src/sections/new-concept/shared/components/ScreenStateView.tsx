import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { BaseEmptyStateView, BrandAppLoader } from '@mu-native/ds'
import { smileHelp } from '@mu-native/icons/smileHelp'
import { translate } from '@mu-native/locale'

type TProps = {
    variant: 'loading' | 'error'
    onRetry?: () => void
}

/** Full-screen first-frame state for controller-backed screens: spinner or error + retry. */
export const ScreenStateView = ({ variant, onRetry }: TProps) => {
    if (variant === 'loading') {
        return (
            <View style={styles.loader}>
                <BrandAppLoader />
            </View>
        )
    }

    return (
        <BaseEmptyStateView
            icon={smileHelp}
            title={translate('native.new_concept.common.error_title')}
            description={translate('native.new_concept.common.error_connection_hint')}
            primaryButton={
                onRetry ? { title: translate('native.actions.retry'), onPress: onRetry } : undefined
            }
        />
    )
}

type TGateProps = {
    /** From `useScreenController` — false until the first successful load. */
    hasData: boolean
    isLoading: boolean
    isError: boolean
    onRetry: () => void
    children: ReactNode
}

/**
 * First-frame gate for controller-backed screens: full-screen error (with retry)
 * or spinner until the first response lands, then always the content — focus
 * refetches keep the previous data visible instead of flashing a spinner.
 */
export const ScreenStateGate = ({ hasData, isLoading, isError, onRetry, children }: TGateProps) => {
    if (!hasData && isError) return <ScreenStateView variant="error" onRetry={onRetry} />
    if (!hasData && isLoading) return <ScreenStateView variant="loading" />
    // eslint-disable-next-line react/jsx-no-useless-fragment -- lifts ReactNode children to a returnable element
    return <>{children}</>
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
