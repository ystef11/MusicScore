// Remote crash reporting and performance telemetry have been removed.
const noop = (..._args: unknown[]) => {}
export const captureException = noop
export const captureMessage = noop
export const setTag = noop
export const setUser = noop
export const addBreadcrumb = noop
export const wrap = <T,>(component: T): T => component

export default {
    initConfig: () => {},
    setUserId: (_id?: string) => {},
    sendMessage: (_methodName: string, _error: unknown, _extra?: unknown) => {},
}
