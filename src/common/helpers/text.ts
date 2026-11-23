/**
 * Sanitizes a user-submitted comment body before it is sent to the API.
 *
 * Blank/whitespace-only lines and runs of consecutive line breaks break the
 * comment UI rendering, so we normalize line endings, collapse any sequence of
 * blank lines into a single line break, and trim the surrounding whitespace.
 */
export function sanitizeCommentBody(text: string): string {
    if (!text) return ''
    return text
        .replace(/\r\n?/g, '\n') // normalize CRLF / CR to LF
        .replace(/(?:[^\S\n]*\n){2,}[^\S\n]*/g, '\n') // collapse blank/whitespace-only lines
        .trim()
}
