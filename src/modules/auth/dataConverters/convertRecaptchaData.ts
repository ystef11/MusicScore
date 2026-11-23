import type { TRecaptchaResponse } from '../types/authTypes'

export const convertRecaptchaData = (data: TRecaptchaResponse) => ({
    domain: data.domain,
    isRequired: data.is_required,
    publicKey: data.public_key,
})

export type TRecaptchaData = ReturnType<typeof convertRecaptchaData>
