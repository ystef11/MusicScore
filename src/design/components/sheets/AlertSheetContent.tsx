import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { MuseButton } from '../../elements/buttons/MuseButton.tsx'
import { useAppSafeArea } from '../../hooks/useAppSafeArea'

import type { TAlertSheetRequest } from './alertSheetHost.ts'
import { SheetTitle } from './SheetTitle.tsx'

type TProps = {
    request: TAlertSheetRequest
    onPress: (id: string) => void
}

export const AlertSheetContent = memo(({ request, onPress }: TProps) => {
    const insets = useAppSafeArea({ bottom: 16 })
    const actions = request.buttons.filter(button => button.style !== 'cancel')
    const cancel = request.buttons.find(button => button.style === 'cancel')

    return (
        <>
            {!!request.title && <SheetTitle title={request.title} subtitle={request.message} />}
            <View style={[styles.buttons, { paddingBottom: insets.bottom }]}>
                {actions.map(button => (
                    <MuseButton
                        key={button.id}
                        title={button.text}
                        type={button.style === 'destructive' ? 'secondary' : 'primary'}
                        titleColor={button.style === 'destructive' ? 'statusError' : undefined}
                        style={styles.button}
                        onPress={() => onPress(button.id)}
                    />
                ))}
                {!!cancel && (
                    <MuseButton
                        title={cancel.text}
                        type="secondary"
                        style={styles.button}
                        onPress={() => onPress(cancel.id)}
                    />
                )}
            </View>
        </>
    )
})
AlertSheetContent.displayName = 'AlertSheetContent'

const styles = StyleSheet.create({
    buttons: {
        paddingHorizontal: 16,
        marginTop: 16,
        width: '100%',
    },
    button: {
        width: '100%',
        justifyContent: 'center',
        marginVertical: 4,
    },
})
