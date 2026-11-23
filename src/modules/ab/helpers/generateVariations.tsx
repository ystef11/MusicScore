export const generateVariations = <T extends Record<string, unknown>>(defaults: T, values: T[]) => {
    const result = [defaults]

    values.forEach(value => {
        result.push(value)
    })

    return result
}
