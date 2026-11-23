let counter = 0

const generateId = () => {
    counter += 1

    return `${Date.now()}${counter}`
}

/** Groups FSR events of one foreground session; a new id is issued each time the app becomes active */
export class PerformanceSessionManager {
    private currentId = generateId()

    get sessionId() {
        return this.currentId
    }

    startNewSession = () => {
        this.currentId = generateId()
    }
}
