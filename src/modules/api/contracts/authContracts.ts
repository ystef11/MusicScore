import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TAuthDataDto,
    TAuthDeviceParamsDto,
    TCaptchaDto,
    TLoginPayloadDto,
    TOauthPayloadDto,
    TOauthUserCheckPayloadDto,
    TQuickAuthPayloadDto,
    TRefreshTokenPayloadDto,
    TRegisterPayloadDto,
} from '../dto/authDto'
import type { TScoreUserDto } from '../dto/userDto'

import { defineContract } from './defineContract'

/**
 * Authentication. The login family is rate limited per IP (hour and day) and may demand a
 * captcha; every success returns `TAuthDataDto`.
 */
export const authContracts = {
    /** Username or email plus password. 429 past the limit, 422 for a wrong or missing captcha. */
    login: defineContract.put<TAuthDataDto, TLoginPayloadDto, TAuthDeviceParamsDto>(
        apiEndpoints.authLogin,
        { version: '1.2' },
    ),
    register: defineContract.post<TAuthDataDto, TRegisterPayloadDto, TAuthDeviceParamsDto>(
        apiEndpoints.authLogin,
        { version: null },
    ),
    oauth: defineContract.post<TAuthDataDto, TOauthPayloadDto, TAuthDeviceParamsDto>(
        apiEndpoints.authOauth,
        { version: null },
    ),
    /** Body is the matched user; only the status matters to the app. */
    oauthUserCheck: defineContract.post<
        TScoreUserDto,
        TOauthUserCheckPayloadDto,
        TAuthDeviceParamsDto
    >(apiEndpoints.authOauthUserCheck, { version: null }),
    /** 200 with a `null` body when the address is taken, 404 when it is free. */
    emailCheck: defineContract.get<null, TAuthDeviceParamsDto & { email: string }>(
        apiEndpoints.authEmailCheck,
        { version: null },
    ),
    /** 200 with a `null` body when the name is taken, 404 when it is free. */
    usernameCheck: defineContract.get<null, TAuthDeviceParamsDto & { username: string }>(
        apiEndpoints.authUsernameCheck,
        { version: null },
    ),
    /** Tokenless and without the API key; the client refreshes on a 401 through this. */
    refresh: defineContract.post<TAuthDataDto, TRefreshTokenPayloadDto>(apiEndpoints.authRefresh, {
        version: null,
    }),
    captcha: defineContract.get<TCaptchaDto>(apiEndpoints.authCapcha, { version: null }),
    /** Deep-link sign-in from the web; 404 for an invalid or expired secret. */
    quick: defineContract.post<TAuthDataDto, TQuickAuthPayloadDto, TAuthDeviceParamsDto>(
        apiEndpoints.authMobWeb,
        { version: null },
    ),
}
