import { activityModuleStoreChunk } from '@mu-native/activity'
import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import ActivitySettingsList from './ActivitySettingsList'

const ActivityNotifications = () => {
    const [activitySettings] = useValues([activityModuleStoreChunk.props.getSettings])

    const data = activitySettings
        .filter(setting => [20, 21, 22, 31].includes(setting.verb))
        .map(setting => {
            if (setting.verb === 20) {
                return {
                    ...setting,
                    source: icons.message,
                    name: 'score_comment',
                    text: translate('native.activity.notifications.your_score_commented'),
                }
            }

            if (setting.verb === 21) {
                return {
                    ...setting,
                    source: icons.chat,
                    name: 'score_comment_reply',
                    text: translate('native.activity.notifications.your_comment_replied'),
                }
            }

            if (setting.verb === 22) {
                return {
                    ...setting,
                    source: icons.favorite,
                    name: 'favorite',
                    text: translate('native.activity.notifications.your_score_favorited'),
                }
            }
            if (setting.verb === 31) {
                return {
                    ...setting,
                    source: icons.userAdd,
                    name: 'follower',
                    text: translate('native.activity.notifications.new_follower'),
                }
            }

            return setting
        })

    return <ActivitySettingsList settings={data} />
}

export default ActivityNotifications
