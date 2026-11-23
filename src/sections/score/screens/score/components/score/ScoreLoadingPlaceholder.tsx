import { memo, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { platform } from '@mu-native/common'
import { colors, style, BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_LINK } from '../../../../../../App/constants/styles'

const styles = StyleSheet.create({
    container: style.view({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    }),
    loadingText: style.text({
        color: COLOR_LINK,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    }),
})

const SHOW_EXTRA_TEXT_DELAY = 5000 // ms
const EXTRA_DELAY_WHEN_LOADED = platform.isIos ? 300 : 500 // ms

const ScoreLoadingPlaceholder = ({ isLoading }: { isLoading: boolean }) => {
    const [isLoadingInternal, setIsLoadingInternal] = useState(isLoading)
    const [showExtraText, setShowExtraText] = useState(false)

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        if (isLoading) {
            timer = setTimeout(() => setShowExtraText(true), SHOW_EXTRA_TEXT_DELAY)
        }
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [isLoading])

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        if (isLoading && !isLoadingInternal) {
            setIsLoadingInternal(isLoading)
        }
        if (!isLoading && isLoadingInternal) {
            timer = setTimeout(() => {
                setIsLoadingInternal(isLoading)
            }, EXTRA_DELAY_WHEN_LOADED)
        }
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [isLoading, isLoadingInternal])

    if (!isLoadingInternal) return null

    return (
        <View style={styles.container}>
            <BrandAppLoader />
            {showExtraText && (
                <Text style={styles.loadingText}>{translate('native.scoreIsLoading')}</Text>
            )}
        </View>
    )
}

export default memo(ScoreLoadingPlaceholder)
