import type { IconSource } from '../Icon/Icon'

export type TAlertSheetButton = {
    id: string
    text: string
    style: 'default' | 'destructive' | 'cancel'
    icon?: IconSource
}

export type TAlertSheetRequest = {
    /** `alert` рисует стопку кнопок, `actions` — строки с иконками. */
    kind: 'alert' | 'actions'
    title?: string
    message?: string
    isDark?: boolean
    buttons: TAlertSheetButton[]
    /** Identifies which showAlertSheet() call a resolveAlertSheet() belongs to. */
    token: number
}

let present: ((request: TAlertSheetRequest) => void) | undefined
let pendingToken: number | undefined
let pendingResolve: ((id: string | undefined) => void) | undefined
let nextToken = 0

/** Вызывается из AppAlertHost при монтировании. Возвращает отписку. */
export function registerAlertSheetHost(handler: (request: TAlertSheetRequest) => void) {
    present = handler
    return () => {
        if (present === handler) present = undefined
        settleAlertSheet()
    }
}

/** No-op unless `token` matches the currently pending request. */
export function resolveAlertSheet(token: number, id: string | undefined) {
    if (pendingToken !== token) return
    const resolve = pendingResolve
    pendingToken = undefined
    pendingResolve = undefined
    resolve?.(id)
}

/** Шторка закрыта без выбора: свайп, затемнение или её вытеснил следующий запрос. */
export function settleAlertSheet() {
    const resolve = pendingResolve
    pendingToken = undefined
    pendingResolve = undefined
    resolve?.(undefined)
}

export function showAlertSheet(
    request: Omit<TAlertSheetRequest, 'token'>,
): Promise<string | undefined> {
    return new Promise(resolve => {
        if (!present) {
            if (__DEV__) console.warn('🍓[showAlertSheet] AppAlertHost is not mounted')
            resolve(undefined)
            return
        }
        // Одна шторка за раз: новый запрос вытесняет предыдущий.
        settleAlertSheet()
        const token = nextToken++
        pendingToken = token
        pendingResolve = resolve
        present({ ...request, token })
    })
}
