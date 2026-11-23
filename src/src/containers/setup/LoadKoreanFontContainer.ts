import { useEffect } from 'react'

import * as RNFS from '@dr.pogodin/react-native-fs'
import { globalStorage } from '@mu-native/common'
import { xtz } from '@mu-native/xtz'

export const LoadKoreanFontContainer = () => {
    useEffect(() => {
        const loadFont = async () => {
            try {
                await RNFS.readDir(`${RNFS.DocumentDirectoryPath}/fonts`)
            } catch (error) {
                await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/fonts`)
            }

            try {
                const isDownloaded = globalStorage.get('isKoreanFontDownloaded')

                if (!isDownloaded) {
                    const fontlist = `${RNFS.DocumentDirectoryPath}/fonts/fontslist.json`
                    if (await RNFS.exists(fontlist)) {
                        await RNFS.unlink(fontlist)
                    }
                    const file = 'SourceHanSerif-VF.otf.ttc'
                    const result = await RNFS.downloadFile({
                        fromUrl:
                            'https://musescore.com/static/musescore/fonts/SourceHanSerif-ExtraLight.otf',
                        toFile: `${RNFS.DocumentDirectoryPath}/fonts/${file}`,
                        begin: ({ contentLength: size }) => {
                            RNFS.writeFile(
                                fontlist,
                                JSON.stringify([
                                    {
                                        file,
                                        family: 'Source Han Serif',
                                        bold: false,
                                        italic: false,
                                        size,
                                    },
                                ]),
                            )
                        },
                    }).promise

                    if (result.statusCode === 200) {
                        globalStorage.set('isKoreanFontDownloaded', true)
                    }
                }
            } catch (e: any) {
                console.error(
                    `[loadkoreanfont] error: ${e?.message || e?.toString() || 'Unknown error'}`,
                )
            }
            xtz.tryLoadingAdditionalFonts()
        }
        loadFont().then(() => console.log(`[loadkoreanfont] успешно загружен`))
    }, [])

    return null
}
