import uniqueId from 'lodash.uniqueid'

export const getEventId = () => {
    return uniqueId(`event_${Date.now()}_`)
}
