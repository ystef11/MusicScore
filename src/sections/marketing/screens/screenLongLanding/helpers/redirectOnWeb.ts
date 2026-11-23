import { Linking } from 'react-native'

export const redirectOnWeb = (profileId: number | null) => {
    const url = profileId
        ? `https://musescore.com/user/${profileId}/subscription`
        : 'https://musescore.com/user/'

    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url)
        } else {
            console.error("Don't know how to open URI: ", url)
        }
    })
}
