export function addOrRemove<T>(array: Array<T>, element: T) {
    const index = array.findIndex(item => item === element)

    if (index !== -1) {
        const copy = [...array]
        copy.splice(index, 1)
        return copy
    }

    return [...array, element]
}
