/**
 * Форматирует секунды в строку вида "00:42", показывая время в минутах и секундах
 */
export const formatSecondsAsMinutesAndSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const minutesString = minutes.toString().padStart(2, '0')
    const secondsString = remainingSeconds.toString().padStart(2, '0')

    return `${minutesString}:${secondsString}`
}
