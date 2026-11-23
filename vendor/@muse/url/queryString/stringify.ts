const stringifyPrimitive = (v: unknown) => {
    switch (typeof v) {
        case 'string':
            return v
        case 'boolean':
            return v ? 'true' : 'false'
        case 'number':
            return isFinite(v) ? v : ''
        default:
            return ''
    }
}

const wrap = (value: unknown) => encodeURIComponent(stringifyPrimitive(value))

const toInt = (val: string) => {
    const valInt = parseInt(val, 10)

    return !isNaN(valInt) ? valInt : val
}

const byAlphabet = (a: string, b: string) => {
    const prev = toInt(a)
    const next = toInt(b)

    if (prev < next) {
        return -1
    }

    if (prev > next) {
        return 1
    }
    return 0
}

export default (obj: Record<string, unknown>, sep = '&', eq = '=') =>
    Object.keys(obj)
        .sort(byAlphabet)
        .map(key => {
            const ks = wrap(key)
            const value = obj[key]

            if (value === undefined || !ks) {
                return ''
            }

            if (value === null) {
                return ks
            }

            if (Array.isArray(value)) {
                return value.map(v => `${ks}[]${eq}${wrap(v)}`).join(sep)
            }
            return `${ks}${eq}${wrap(value)}`
        })
        .filter(Boolean)
        .join(sep)
