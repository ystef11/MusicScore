import { useRef, useState } from 'react'
import { Alert, I18nManager, Platform, Pressable, StyleSheet, type ViewInstance } from 'react-native'
import { PopoverPlacement, Rect } from 'react-native-popover-view'

import { FloatingMenu, Icon, brandColors, showAlertNotification, type TFloatingMenuOption } from '@mu-native/ds'
import { detail } from '@mu-native/icons/detail'
import { getCurrentLocaleCode, translate } from '@mu-native/locale'

import SongBookController, { canRefreshOfflineScore } from '../../Controllers/SongBookController'
import type { MSScoreT } from '../../Model/MSScore'

type Action = 'export' | 'refresh' | 'delete'

const MENU_WIDTH = 160
const MENU_PLACEMENTS = [PopoverPlacement.BOTTOM, PopoverPlacement.TOP]

export function OfflineScoreMenu({ score }: { score: MSScoreT }) {
    const button = useRef<ViewInstance>(null)
    const pending = useRef(false)
    const [visible, setVisible] = useState(false)
    const [menuAnchor, setMenuAnchor] = useState<Rect>()
    const [busy, setBusy] = useState(false)
    const russian = getCurrentLocaleCode() === 'ru'

    const deleteTitle = russian ? 'Удалить офлайн-копию?' : 'Delete offline copy?'
    const options: TFloatingMenuOption<Action>[] = [
        { id: 'export', label: russian ? 'Экспорт' : 'Export', disabled: Platform.OS !== 'android' },
        { id: 'refresh', label: russian ? 'Обновить' : 'Refresh', disabled: !canRefreshOfflineScore(score) },
        { id: 'delete', label: translate('native.score_action_sheet.delete_button') },
    ]

    const run = async (operation: () => Promise<void>) => {
        if (pending.current) return
        pending.current = true
        setBusy(true)
        try {
            await operation()
        } catch (error) {
            if ((error as { code?: string })?.code !== 'CANCELLED') {
                Alert.alert(translate('native.alerts.error_occurred'),
                    error instanceof Error ? error.message : undefined)
            }
        } finally {
            pending.current = false
            setBusy(false)
        }
    }

    const onSelect = (action: Action) => {
        switch (action) {
            case 'export':
                void run(() => SongBookController.exportOffline(score))
                break
            case 'refresh':
                void run(async () => {
                    await SongBookController.refreshOffline(score)
                    showAlertNotification({ title: russian ? 'Партитура обновлена' : 'Score refreshed' })
                })
                break
            case 'delete':
                Alert.alert(deleteTitle, score.title, [
                    { text: translate('native.search.cancel_button'), style: 'cancel' },
                    {
                        text: translate('native.score_action_sheet.delete_button'),
                        style: 'destructive',
                        onPress: () => void run(() => SongBookController.removeFromSongBook(score, true)),
                    },
                ])
                break
        }
    }

    const openMenu = () => {
        button.current?.measureInWindow((x, y, width, height) => {
            if (!width || !height) return
            // Use the button's window coordinates directly on Android edge-to-edge.
            // The popover centers on this point, aligning its trailing edge with the button.
            const centerX = I18nManager.isRTL ? x + MENU_WIDTH / 2 : x + width - MENU_WIDTH / 2
            setMenuAnchor(new Rect(centerX, y, 0, height))
            setVisible(true)
        })
    }

    return (
        <>
            <Pressable
                ref={button}
                collapsable={false}
                style={styles.button}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={russian ? 'Действия с партитурой' : 'Score actions'}
                testID={`offline-score-menu-${score.id}`}
                onPress={openMenu}
            >
                <Icon source={detail} size={20} tint={brandColors.contentPrimary} style={styles.verticalDots} />
            </Pressable>
            <FloatingMenu
                anchor={menuAnchor}
                isVisible={visible}
                options={options}
                placement={MENU_PLACEMENTS}
                width={MENU_WIDTH}
                onSelect={onSelect}
                onClose={() => setVisible(false)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    button: { width: 44, height: 44, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
    verticalDots: { transform: [{ rotate: '90deg' }] },
})
