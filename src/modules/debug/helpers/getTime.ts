const formatTime = (time: number, isMilliseconds?: boolean) => {
    const value = String(time)

    if ((isMilliseconds && value.length < 3) || value.length === 1) return `0${value}`

    return value
}

export const getTime = () => {
    const date = new Date()
    const hours = formatTime(date.getHours())
    const minutes = formatTime(date.getMinutes())
    const seconds = formatTime(date.getSeconds())
    const milliseconds = formatTime(date.getMilliseconds(), true)

    return `${hours}:${minutes}:${seconds}.${milliseconds}`
}
