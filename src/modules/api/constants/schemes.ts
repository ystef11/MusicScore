// eslint-disable-next-line import/no-relative-packages
import { translate } from '../../locale'

export const SUPPORTED_LINKS = [
    'https://mu.onelink.me',
    'https://musescore.com',
    'https://deeplink.musescore.com',
    'musescore://',
    'muse-mu://',
]

export const SCHEME = 'musescore:/'

export const CREATORS = {
    scores: () => `${SCHEME}/scores`,
    score_id: (score: string) => `${SCHEME}/loadScore/${score}`,
    hub_section: (id: string) => `${SCHEME}/hub_section/${id}`,
    profile_id: (id: string) => `${SCHEME}user/${id}`,
    courses: () => `${SCHEME}/courses`,
    course_id: (id: string) => `${SCHEME}/course_id/${id}`,
    my_sets: (userName = translate('native.user.my')) => `${SCHEME}/my_sets/${userName}`,
    my_scores: () => `${SCHEME}/my_scores`,
    favorites: () => `${SCHEME}/favorites`,
    pro_offer: () => `${SCHEME}/pro_offer`,
    inviteFriends: (userId: string) => `${SCHEME}/inviteFriends/${userId}`,
}
