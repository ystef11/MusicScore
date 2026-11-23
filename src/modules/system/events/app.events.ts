import { createNanoEvents } from './nanoevents'

export type TDeviceVerificationSheetPayload = {
    /** Re-runs the operation that failed; rejects again when the device still cannot be verified. */
    retry?: () => Promise<unknown>
    onDismiss: () => void
    source: string
    cause?: string
}

export type TNpsSheetPayload = {
    sessionNumber: number
}

export interface AppEvents {
    presentScoreRate: (score: any, context: any) => void
    presentScoreDownloadButtons: () => void
    presentForceLogout: () => void
    presentListItemsSheet: (
        items: { text: string; selected: boolean; onPress: () => void }[],
    ) => void
    presentDeviceVerificationSheet: (payload: TDeviceVerificationSheetPayload) => void
    presentNpsSheet: (payload: TNpsSheetPayload) => void
}

export const appEventsEmitter = createNanoEvents<AppEvents>()
