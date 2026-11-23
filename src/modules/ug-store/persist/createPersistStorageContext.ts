export const createPersistStorageContext = <T>(initialContext: T) => {
    let persistContext: T = initialContext

    return {
        get() {
            return persistContext
        },
        set(newContext: T) {
            persistContext = newContext
        },
    }
}
