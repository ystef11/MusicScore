/* eslint-disable no-prototype-builtins */
export default (qs: string, sep = '&', eq = '=') => {
    const obj: Record<string, string[] | any> = {}

    if (typeof qs !== 'string' || qs.length === 0) {
        return obj
    }

    const regexp = /\+/g

    qs.split(sep).forEach(str => {
        const x = str.replace(regexp, '%20')

        const idx = x.indexOf(eq)

        let kstr: string

        let vstr: string

        if (idx >= 0) {
            kstr = x.substr(0, idx)
            vstr = x.substr(idx + 1)
        } else {
            kstr = x
            vstr = ''
        }

        const k = decodeURIComponent(kstr)

        const v = decodeURIComponent(vstr)

        if (k.indexOf('[]') === k.length - 2 && k.length >= 2) {
            const key = k.replace('[]', '')

            if (obj.hasOwnProperty(key)) {
                obj[key].push(v)
            } else {
                obj[key] = [v]
            }
            return
        }
        if (!obj.hasOwnProperty(k)) {
            obj[k] = v
            return
        }
        if (Array.isArray(obj[k])) {
            obj[k].push(v)
            return
        }
        obj[k] = [obj[k], v]
    })

    return obj
}
