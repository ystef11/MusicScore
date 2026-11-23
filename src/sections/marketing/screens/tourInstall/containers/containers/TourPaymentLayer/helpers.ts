import { platform } from '@mu-native/common'
import { translate } from '@mu-native/locale'

export const getStartNowText = (userName: string) =>
    userName && platform.isAndroid
        ? translate('native.marketing.tour.start_now_with_name', { userName })
        : translate('native.screen_tour.start_now_text')
