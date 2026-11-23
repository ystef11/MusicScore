import { memo, useMemo } from 'react'

import { translate } from '@mu-native/locale'
import { quizStoreChunk } from '@mu-native/quiz'
import { useValues } from '@ug/store'

import ProfileSettingsListItem from '../components/ProfileSettingsListItem'

import { IconForwardElement } from '@mu-native/ds'

type TProfileUserPreferencesSettingsListItemProps = {
    onPress: () => void
    testID?: string
}

export const ProfileUserPreferencesSettingsListItem = memo(
    ({ onPress, testID }: TProfileUserPreferencesSettingsListItemProps) => {
        const [quizAnswersNames] = useValues([quizStoreChunk.props.getQuizAnswersNames])
        const quizAnswersStrings = useMemo(() => quizAnswersNames?.join(', '), [quizAnswersNames])

        return (
            <ProfileSettingsListItem
                {...(testID ? { testID } : {})}
                title={translate('native.preferences.profile_title')}
                text={quizAnswersStrings || translate('native.preferences.sub_title')}
                onPress={onPress}
            >
                <IconForwardElement />
            </ProfileSettingsListItem>
        )
    },
)
