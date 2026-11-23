import { apiRequest, userContracts } from '@mu-native/api'
import type { TEmailActivationDto, TUserMeDto } from '@mu-native/api'

/**
 * Email verification for the "verify your email" toast (MUP-13968 /
 * backend MUP-14128).
 *
 * `is_need_verify_email` (root of GET /user/me and of every auth response) is
 * a dedicated backend predicate: `true` = the account was never activated OR
 * the user changed their address and hasn't confirmed the new one. Bans,
 * deletions and unaccepted consents are deliberately NOT in this flag — the
 * backend owns the semantics, the client must not re-derive it from
 * `status` / `is_active`.
 */
export type TUserMeResponse = TUserMeDto

export const fetchUserMeRequest = () => apiRequest(userContracts.me)

/**
 * POST /v2/user/notification/email-activation — resend the activation link.
 * The backend picks the letter (first activation vs changed address).
 *
 * 200 → `block_expires` (unix seconds) until which resending is blocked; the
 * limit is one per account, shared with the website. Errors:
 * - 403 `global.forbidden` — nothing to confirm; our flag is stale, refetch
 *   GET /user/me and hide the toast
 * - 429 `global.too_many_requests` — a letter went out <10 min ago; the body
 *   carries no unblock time, assume 10 minutes
 * - 422 `user.activation_mail_not_sent` — sending failed on the backend;
 *   show "try again later" but keep the button usable
 */
export type TEmailActivationResponse = TEmailActivationDto

export const resendVerificationEmailRequest = () => apiRequest(userContracts.resendActivationEmail)
