import { TPersistentStorage } from './types/AnalyticsTypes'

/**
 * Хранилище событий для логирования
 */
export class LogStorage {
    /** Персистентное объектное хранилище */
    persistentStorage: TPersistentStorage

    /** Временное объектное хранилище */
    storage: Record<string, any> = {
        ids: [],
    }

    /** Маркер для временного сохранения уже отправленных событий */
    shouldStoreSentEvents = true

    /** Техническое хранилище для отправленных событий */
    sentStorage: Record<string, any> = {
        ids: [],
    }

    constructor({ persistentStorage }: { persistentStorage: TPersistentStorage }) {
        this.persistentStorage = persistentStorage
        this.loadFromPersistentStorage()
    }

    /** Получение сохранённых событий из хранилища */
    async loadFromPersistentStorage() {
        const json = await this.persistentStorage.get()

        if (!json) {
            this.storage = {
                ids: [],
            }

            return this.storage
        }

        const savedStorage = JSON.parse(json)

        const keys = Object.keys(savedStorage)
        const ids = keys.map(key => key).filter(key => key !== 'ids')
        savedStorage.ids = ids
        ids.forEach(id => {
            if (typeof savedStorage[id] === 'string') {
                savedStorage[id] = JSON.parse(savedStorage[id])
            }
        })

        this.storage = { ...this.storage, ...savedStorage }

        return this.storage
    }

    /**
     * Получение события по ключу
     * @param key Ключ события
     */
    get(key: string) {
        return this.storage[key]
    }

    /**
     * Добавление события по ключу
     * @param key Ключ события
     * @param value Параметры события
     */
    set(key: string, value: any) {
        this.storage.ids.push(key)
        this.storage[key] = value
    }

    /** Очистка всех данных из хранилища */
    purge() {
        this.storage = {}
        return this.persistentStorage.clear()
    }

    /**
     * Очистка событий из временного хранилища и запись в постоянное
     *
     * @param ids Идентификаторы событий для удаления
     */
    clean(ids: string[]) {
        ids.forEach(id => delete this.storage[id])
        this.storage.ids = this.storage.ids.filter((id: string) => !ids.includes(id))

        this.flush()
    }

    /**
     * Сохранение событий в хранилище
     *
     * @see setPersistentStorage
     */
    flush() {
        return this.persistentStorage.set(JSON.stringify(this.storage))
    }
}

export default LogStorage
