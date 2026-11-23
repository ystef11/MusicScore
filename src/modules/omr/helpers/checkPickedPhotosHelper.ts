import * as fs from '@dr.pogodin/react-native-fs'

// The iOS image picker still returns a uri when it fails to export a photo (e.g. an iCloud
// original that couldn't be downloaded), pointing at a tmp file that was never written.
const isPhotoAvailable = async (uri: string | undefined): Promise<boolean> => {
    if (!uri) return false
    try {
        const { size } = await fs.stat(uri)
        return Number(size) > 0
    } catch {
        return false
    }
}

export const arePickedPhotosAvailable = async (uris: (string | undefined)[]): Promise<boolean> =>
    (await Promise.all(uris.map(isPhotoAvailable))).every(Boolean)
