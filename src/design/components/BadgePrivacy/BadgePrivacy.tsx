import { lock } from '@mu-native/icons/lock'
import { userGroup } from '@mu-native/icons/userGroup'
import { translate } from '@mu-native/locale/i18n'

import { ScorePrivacy } from '../../constants/scorePrivacy'
import { AppBadge } from '../AppBadge.tsx'

type TProps = {
    privacy: number
}

export const BadgePrivacy = ({ privacy }: TProps) => {
    const isPrivate = privacy !== ScorePrivacy.PUBLIC

    return (
        <AppBadge
            title={translate(
                isPrivate ? 'native.privacy.private_badge' : 'native.privacy.public_badge',
            )}
            icon={isPrivate ? lock : userGroup}
            backgroundColor="colorBackgroundDisabled"
            textColor="contentPrimary"
        />
    )
}
