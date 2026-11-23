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

export const ActionSheetContent = memo(({ request, onPress }: TProps) => {
    const insets = useAppSafeArea({ bottom: 16 })
    const actions = request.buttons.filter(button => button.style !== 'cancel')
    const cancel = request.buttons.find(button => button.style === 'cancel')

    return (
        <>
            {!!request.title && <SheetTitle title={request.title} subtitle={request.message} />}
            <View style={[styles.buttons, { paddingBottom: insets.bottom }]}>
                {actions.map(button => {
                    const isDestructive = button.style === 'destructive'
                    return (
                        <MuseButton
                            key={button.id}
                            title={button.text}
                            type="secondary"
                            titleColor={isDestructive ? 'statusError' : undefined}
                            startIcon={button.icon}
                            startIconTint={isDestructive ? 'statusError' : undefined}
                            style={styles.button}
                            onPress={() => onPress(button.id)}
                        />
                    )
                })}
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
ActionSheetContent.displayName = 'ActionSheetContent'

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
