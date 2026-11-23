import { translate } from '@mu-native/locale'

import { ScorePrivacy, type ScorePrivacyValue } from '../../../../App/Model/MSScore'

export const getAccessOptions = (): { key: ScorePrivacyValue; label: string }[] => [
    { key: ScorePrivacy.PUBLIC, label: translate('native.make_public.access_anyone') },
    { key: ScorePrivacy.LINK, label: translate('native.make_public.access_link') },
    { key: ScorePrivacy.PRIVATE, label: translate('native.make_public.access_private') },
]

export const MAX_GENRES = 3

export type CopyrightOption =
    | 'all_rights_reserved'
    | 'cc_by'
    | 'cc_by_nd'
    | 'cc_by_sa'
    | 'cc_by_nc'
    | 'cc_by_nc_nd'
    | 'cc_by_nc_sa'
    | 'cc_zero'

export const getCopyrightOptions = () => [
    {
        key: 'all_rights_reserved' as const,
        label: translate('native.make_public.copyright_all_rights'),
    },
    { key: 'cc_by' as const, label: translate('native.make_public.copyright_cc_by') },
    { key: 'cc_by_nd' as const, label: translate('native.make_public.copyright_cc_by_nd') },
    { key: 'cc_by_sa' as const, label: translate('native.make_public.copyright_cc_by_sa') },
    { key: 'cc_by_nc' as const, label: translate('native.make_public.copyright_cc_by_nc') },
    { key: 'cc_by_nc_nd' as const, label: translate('native.make_public.copyright_cc_by_nc_nd') },
    { key: 'cc_by_nc_sa' as const, label: translate('native.make_public.copyright_cc_by_nc_sa') },
    { key: 'cc_zero' as const, label: translate('native.make_public.copyright_cc_zero') },
]
