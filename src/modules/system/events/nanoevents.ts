interface EventsMap {
    [event: string]: any
}

interface DefaultEvents extends EventsMap {
    [event: string]: (...args: any) => void
}

interface Unsubscribe {
    (): void
}

export interface Emitter<Events extends EventsMap = DefaultEvents> {
    emit<K extends keyof Events>(this: this, event: K, ...args: Parameters<Events[K]>): void
    events: Partial<{ [E in keyof Events]: Events[E][] }>
    on<K extends keyof Events>(this: this, event: K, cb: Events[K]): Unsubscribe
}

export function createNanoEvents<Events extends EventsMap = DefaultEvents>(): Emitter<Events> {
    return {
        emit(event, ...args) {
            for (
                let i = 0, callbacks = this.events[event] || [], { length } = callbacks;
                i < length;
                i++
            ) {
                callbacks[i](...args)
            }
        },
        events: {},
        on(event, cb) {
            ;(this.events[event] ||= []).push(cb)
            return () => {
                this.events[event] = this.events[event]?.filter(i => cb !== i)
            }
        },
    }
}
