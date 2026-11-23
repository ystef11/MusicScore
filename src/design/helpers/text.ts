const titleCase = (str: string): string =>
    str
        .split(' ')
        ?.map(word => {
            return word.charAt(0).toUpperCase() + word.substring(1)
        })
        .join(' ')

export const textHelpers = {
    titleCase,
}
