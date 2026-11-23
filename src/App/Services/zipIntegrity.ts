/**
 * A complete zip ends with an end-of-central-directory record, and the engine
 * refuses a file without one ("Zip: EndOfDirectory not found"). A download cut
 * off mid-body still lands as a plausible file, so check for that record before
 * letting it into the cache (MUP-14163).
 */

/** EOCD signature: 0x50 0x4B 0x05 0x06. Plain "PK" would match every local
 *  header in the archive, so the two trailing bytes are what matters. */
const ZIP_EOCD_SIGNATURE = '\x50\x4b\x05\x06'

/**
 * The record is 22 bytes plus an optional trailing comment. Scores carry no
 * comment, so a short tail suffices — a commented archive would read as
 * incomplete here, which only costs a re-download.
 */
export const ZIP_TAIL_BYTES = 512

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Decodes base64 into a binary string (one char per byte). RNFS can read a file
 * as 'ascii', but that mangles bytes above 0x7F and could fake a signature
 * match, so the tail is read as base64 and decoded here.
 */
export const decodeBase64 = (input: string): string => {
    const clean = input.replace(/[^A-Za-z0-9+/]/g, '')
    let out = ''
    let buffer = 0
    let bits = 0

    for (const char of clean) {
        const value = BASE64_ALPHABET.indexOf(char)
        if (value === -1) continue
        buffer = (buffer << 6) | value
        bits += 6
        if (bits >= 8) {
            bits -= 8
            out += String.fromCharCode((buffer >> bits) & 0xff)
        }
    }

    return out
}

/** @param tailBase64 last bytes of the file, base64-encoded */
export const hasZipEndOfCentralDirectory = (tailBase64: string) =>
    decodeBase64(tailBase64).includes(ZIP_EOCD_SIGNATURE)

/** Local file header signature: 0x50 0x4B 0x03 0x04. Every zip opens with it. */
const ZIP_LOCAL_HEADER_SIGNATURE = '\x50\x4b\x03\x04'

export const ZIP_MAGIC_BYTES = ZIP_LOCAL_HEADER_SIGNATURE.length

/**
 * Scores are downloaded as XTZ containers ("XTZ\0" + an encrypted body): the
 * archive only exists after the engine unwraps them, so their tail carries no
 * end-of-central-directory record and checking for one rejects every healthy
 * score (MUP-14167). Look for the record only in a file that really is a zip.
 *
 * @param headBase64 first {@link ZIP_MAGIC_BYTES} of the file, base64-encoded
 */
export const isZipArchive = (headBase64: string) =>
    decodeBase64(headBase64).startsWith(ZIP_LOCAL_HEADER_SIGNATURE)

/**
 * A download that ended early can still report success, so compare what the
 * server announced with what actually landed. Servers may omit Content-Length
 * (chunked responses); then there is nothing to compare and the zip check is
 * the only guard left.
 */
export const isTruncatedDownload = (bytesWritten: number, contentLength?: number) =>
    typeof contentLength === 'number' && contentLength > 0 && bytesWritten < contentLength
