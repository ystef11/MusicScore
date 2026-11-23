import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { quizStoreChunk } from '@mu-native/quiz'
import { useValues } from '@ug/store'

type TUserNameInfo = {
    value: string
    source: string
}

export const useGetUserNameInfo = (): TUserNameInfo => {
    const [quizUsername, isAuthorized, userInfo] = useValues([
        quizStoreChunk.props.getUserName,
        getIsAuthorized,
        authStoreChunk.props.getUser,
    ])

    const userProfileInfo = isAuthorized && userInfo
    const userName = userProfileInfo && userProfileInfo.name
    const username = userName || quizUsername

    const usernameSource = (() => {
        if (username === userName) return 'username'
        if (username === quizUsername) return 'tour'
        return 'none'
    })()

    return {
        value: username,
        source: usernameSource,
    }
}
