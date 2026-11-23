export const compact = (data: Record<string, unknown>) => {
    const obj = { ...data }
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])

    return obj
}
