export const capitalizeFirstLetter = (string: string): string =>
    string.charAt(0).toUpperCase() + string.slice(1)
export const lowerizeFirstLetter = (str: string): string => `${str[0].toLowerCase()}${str.slice(1)}`
export const titleCase = (str: string): string =>
    str
        .split(' ')
        ?.map(word => {
            return word.charAt(0).toUpperCase() + word.substring(1)
        })
        .join(' ')
