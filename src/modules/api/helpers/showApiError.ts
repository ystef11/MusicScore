import { isResponse } from '@mu-native/api'
import { showAlertNotification } from '@mu-native/ds'

export const showApiError = async ({ error, title = '' }: { error: unknown; title?: string }) => {
    if (isResponse(error)) {
        try {
            const json = await error.json()
            if (json?.message) {
                showAlertNotification({
                    title: json.message,
                    expiresIn: 5000,
                })
            }
            // eslint-disable-next-line no-empty
        } catch {}
    } else {
        showAlertNotification({
            title,
            expiresIn: 5000,
        })
    }
}
