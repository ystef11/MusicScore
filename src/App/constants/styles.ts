import { Dimensions } from 'react-native'

export const COLOR_ACTIVE = '#3AC696'
export const COLOR_DISABLE = '#C2D0DC'
export const COLOR_LINK = '#2E68C0'
export const COLOR_TEXT = '#224766'

// named color
export const COLOR_WHITE = '#FFFFFF'
export const COLOR_WHITE_100 = '#F4F5F7'
export const COLOR_GRAY = '#EBEFF3'
export const COLOR_BLUE_600 = '#2E68C0'
export const COLOR_BLACK = '#37474F'
export const COLOR_SILVER_DEEP = '#78909C'
export const COLOR_SILVER_DEEP_0_5 = 'rgba(120, 144, 156, 0.5)'
export const COLOR_LIGHT_BLUE = '#ECEFF1'
export const COLOR_SILVER = '#ECEFF1'
export const COLOR_DEEP_BLUE = '#1D3850'
export const TRANSPARENT = 'transparent'
export const COLOR_MODAL = 'rgba(0, 0, 0, 0.56)'
export const COLOR_PRACTICE_MODE = '#2A89DB'
export const COLOR_PRACTICE_MODE_0_5 = 'rgba(42, 137, 219, 0.5)'
export const COLOR_NOTIFICATION = '#FF6E88'
export const COLOR_GREY_100 = '#CFD8DC'
export const COLOR_GREY_200 = '#DBE3E9'
export const COLOR_GREY_300 = '#90A4AE'
export const COLOR_GREY_400 = '#78909C'
export const COLOR_GREY_500 = '#607087'
export const COLOR_GREY_600 = '#546E7A'
export const COLOR_GREY_700 = '#364152'
export const COLOR_GREY_900 = '#263238'
export const COLOR_GREEN_GO_PRO = '#FC5E59'
export const COLOR_GREEN_PRO_LABEL = '#11965E'
export const PRO_PLUS_COLOR = '#1C6CE2'
export const COLOR_BORDER_LIGHT = '#D2D6DC'
export const COLOR_DISABLED_BUTTON = '#E5E7EB'
export const TEXT_COLOR_400 = '#94A0B0'
export const TEXT_COLOR_900 = '#1A202E'

export const FONT_SIZE_REGULAR = 14
export const shadowElevation = (value: number) => ({
    elevation: value,
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowColor: 'black',
    shadowOpacity: value / 10,
})
export const MARGIN_XS = 4
export const MARGIN_SM = 8
export const MARGIN_XM = 12
export const MARGIN_MD = 16
export const MARGIN_LG = 24
export const MARGIN_XL = 32
export const FULL_WIDTH_PERCENT = '100%'
export const FULL_SCREEN_WIDTH = Dimensions.get('window').width
export const getFullScreenWidth = () => Dimensions.get('window').width
export const MAX_TABLET_WIDTH = 848
