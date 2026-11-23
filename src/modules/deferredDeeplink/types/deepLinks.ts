export const enum DeepLinksTypes {
    inviteFriend = 'friend',
    stripe = 'stripe',
    mobWebOffer = 'mob_web_offer',
    mobWebAuth = 'mob_web_auth',
    auth = 'auth',
}

export type DeepLinksValues = (typeof DeepLinksTypes)[keyof typeof DeepLinksTypes]
