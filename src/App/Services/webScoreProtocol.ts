import { URL } from 'react-native-url-polyfill'

// Reads links advertised by the web player; does not execute website JavaScript.
export type WebScoreFile = { url: string; format: 'mscz' | 'mscx' | 'mxl' | 'musicxml' | 'xml' }
const formats = new Set(['mscz', 'mscx', 'mxl', 'musicxml', 'xml'])
export function decodeWebEntities(value: string): string {
    return value.replace(/&(?:quot|apos|amp|lt|gt|#(?:x[0-9a-f]+|[0-9]+));/gi, entity => {
        const named: Record<string, string> = { '&quot;': '"', '&apos;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>' }
        if (named[entity.toLowerCase()]) return named[entity.toLowerCase()]
        const code = entity.slice(2, -1)
        const point = parseInt(code[0].toLowerCase() === 'x' ? code.slice(1) : code, code[0].toLowerCase() === 'x' ? 16 : 10)
        return point <= 0x10ffff ? String.fromCodePoint(point) : entity
    })
}
export function trustedWebUrl(value: string, base: string): string | null {
    try {
        const url = new URL(decodeWebEntities(value), base)
        if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null
        const host = url.hostname.toLowerCase()
        if (!['musescore.com', 'ustatik.com', 'musescore.org'].some(domain => host === domain || host.endsWith('.' + domain))) return null
        return url.href
    } catch { return null }
}
export function webPageState(html: string): unknown[] {
    const states: unknown[] = []
    for (const match of html.matchAll(/\bdata-content\s*=\s*(["'])([\s\S]*?)\1/gi)) {
        try { states.push(JSON.parse(decodeWebEntities(match[2]))) } catch { /* Other data attributes are not JSON. */ }
    }
    for (const match of html.matchAll(/<script\b[^>]*type=["']application\/(?:ld\+)?json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
        try { states.push(JSON.parse(match[1])) } catch { /* Ignore unrelated script blocks. */ }
    }
    // MuseScore's hydrated store is a JSON object assigned to UGAPP.store.
    for (const match of html.matchAll(/(?:UGAPP\.store|__INITIAL_STATE__)\s*=\s*(?=\{)/g)) {
        const start = (match.index || 0) + match[0].length
        let depth = 0, quoted = false, escaped = false
        for (let i = start; i < html.length; i++) {
            const ch = html[i]
            if (quoted) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === '"') quoted = false }
            else if (ch === '"') quoted = true
            else if (ch === '{') depth++
            else if (ch === '}' && --depth === 0) {
                try { states.push(JSON.parse(html.slice(start, i + 1))) } catch { /* Never evaluate executable JS. */ }
                break
            }
        }
    }
    return states
}
export function advertisedScoreFiles(html: string, pageUrl: string): WebScoreFile[] {
    const files: WebScoreFile[] = []
    const add = (value: unknown, hint?: string) => {
        if (typeof value !== 'string') return
        const url = trustedWebUrl(value, pageUrl)
        if (!url) return
        const path = new URL(url).pathname
        const ext = path.match(/\.(mscz|mscx|mxl|musicxml|xml)$/i)?.[1]?.toLowerCase()
            || path.match(/\/download\/(mscz|mscx|mxl|musicxml|xml)\/?$/i)?.[1]?.toLowerCase()
            || hint?.toLowerCase()
        if (!ext || !formats.has(ext)) return
        if (!files.some(file => file.url === url)) files.push({url, format: ext as WebScoreFile['format']})
    }
    const visit = (value: any, depth = 0) => {
        if (!value || typeof value !== 'object' || depth > 14) return
        if (Array.isArray(value)) { value.forEach(item => visit(item, depth + 1)); return }
        const hint = typeof value.type === 'string' ? value.type : value.format
        if (formats.has(hint)) { add(value.url, hint); add(value.download_url, hint) }
        for (const [key, child] of Object.entries(value)) {
            if (formats.has(key)) {
                if (typeof child === 'string') add(child, key)
                else if (child && typeof child === 'object') {
                    add((child as any).url, key); add((child as any).download_url, key)
                }
            }
            // Generic URLs are accepted only when their path names a supported score format.
            if (key === 'url' || key === 'download_url') add(child)
            visit(child, depth + 1)
        }
    }
    webPageState(html).forEach((state: any) => {
        const data = state?.store?.page?.data || state?.page?.data || state
        // Do not accidentally load a recommended score from the same page.
        if (data?.score) visit(data.score)
        if (data?.type_download_list) visit(data.type_download_list)
        if (data?.urls) visit({urls: data.urls})
    })
    for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) add(match[2])
    // Prefer MuseScore's original engraving over an interchange export.
    return files.sort((a, b) => ['mscz','mscx','mxl','musicxml','xml'].indexOf(a.format) - ['mscz','mscx','mxl','musicxml','xml'].indexOf(b.format))
}
export function webHttpError(status: number, html: string): Error {
    if (/window\._cf_chl_opt|<title>Just a moment/i.test(html))
        return new Error('Сайт требует дополнительную проверку доступа (Cloudflare) и не выдал файл нот.')
    if (status === 401 || status === 403)
        return new Error('Сайт не разрешил скачивание этой партитуры.')
    if (status === 404) return new Error('Партитура не найдена в веб-каталоге.')
    if (status === 429) return new Error('Источник нот ограничил число запросов. Повторите позже.')
    return new Error('Не удалось получить файл нот: HTTP ' + status)
}
