import { headerValues } from '@mu-native/api'
import { device, platform } from '@mu-native/common'

import { rtAnalyticsService } from '../services/rtAnalyticsService'

/**
 * Builds the `context` envelope for the RT analytics backup endpoint (MUP-13903).
 *
 * Mirrors the web payload shape. Two fields have no client-side source on mobile:
 * - `backend_version` — the backend release version is not known to the mobile client.
 * - `ip_address` — derived server-side from the request by the ingest endpoint.
 * Both are sent empty so the envelope keeps a stable, predictable shape.
 */
export const getBackupContext = () => ({
    country: rtAnalyticsService.getIPCountry() ?? '',
    app_version: device.appVersionFormatted,
    backend_version: '',
    user_agent: headerValues.userAgent,
    source: `MS_${platform.isIos ? 'IOS' : 'ANDROID'}`,
    ip_address: '',
})
