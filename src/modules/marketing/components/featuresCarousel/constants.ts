import { platform } from '@mu-native/common'
import { icons, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { type TFeatureLandingName } from '../../types/marketingTypes'

const titleBuyFeature: Record<string, string> = {
    'marketing_text.export_pdf': translate('native.screen_sft.carousel.pdf_title'),
    'marketing_text.export_midi': translate('native.screen_sft.carousel.midi_title'),
    'marketing_text.export_mp3': translate('native.screen_sft.carousel.mp3_title'),
}

export const getFeaturesSubscription = ({
    landingName,
    currentCourseName = '',
    firstFeature = '',
    coursesCount,
}: {
    landingName: TFeatureLandingName
    currentCourseName?: string
    firstFeature?: string
    coursesCount: number
}) => {
    if (landingName === 'ebook') {
        return [
            {
                image: icons.timerIconBg,
                title: translate('native.marketing.feature.quick_load'),
                subTitle: translate('native.marketing.feature.quick_load_sub_title'),
                featureText: 'Quick',
            },
            {
                image: icons.bookOutlinedIcon,
                title: translate('native.marketing.feature.seamless'),
                subTitle: translate('native.marketing.feature.seamless_sub_title'),
                featureText: 'seamless',
            },
            {
                image: icons.searchIcon,
                title: translate('native.marketing.feature.quick_search'),
                subTitle: translate('native.marketing.feature.quick_load_sub_title'),
                featureText: 'quick_search',
            },
            {
                image: icons.crossPlatformIcon,
                title: translate('native.marketing.feature.mobile_design'),
                subTitle: translate('native.marketing.feature.mobile_design_sub_title'),
                featureText: 'mobile',
            },
            {
                image: icons.compositionIcon,
                title: translate('native.marketing.feature.growing_library'),
                subTitle: translate('native.marketing.feature.growing_library_sub_title'),
                featureText: 'growing',
            },
        ]
    }
    return landingName.includes('learning')
        ? [
              ...(currentCourseName
                  ? [
                        {
                            image: icons.currentCourseSftLanding,
                            title: translate('native.screen_sft.carousel.full_access_title'),
                            subTitle: currentCourseName,
                            featureText: 'courses',
                        },
                    ]
                  : []),
              {
                  image: icons.courseSftLanding,
                  title:
                      landingName === 'learningLite'
                          ? translate('native.marketing.feature.editor_picks')
                          : translate('native.screen_sft.carousel.courses_title'),
                  subTitle:
                      landingName === 'learningLite'
                          ? translate('native.marketing.feature.editor_picks_enjoy')
                          : translate(
                                'native.marketing.features_carousel.courses_sub_title_count',
                                {
                                    count: coursesCount,
                                },
                            ),
                  featureText: 'courses',
              },
              {
                  image: icons.downloadSftLanding,
                  title: translate('native.screen_sft.carousel.material_title'),
                  subTitle: translate('native.screen_sft.carousel.material_sub_title'),
                  featureText: 'courses',
              },
          ]
        : [
              {
                  image: icons.pdfSftLanding,
                  title:
                      titleBuyFeature[firstFeature] ||
                      translate('native.screen_sft.carousel.pdf_title'),
                  subTitle: translate('native.screen_sft.carousel.pdf_sub_title'),
                  featureText: 'marketing_text.export_pdf',
              },
              {
                  image: icons.keyboardSftLanding,
                  title: translate('native.screen_sft.carousel.keyboard_title'),
                  subTitle: translate('native.screen_sft.carousel.keyboard_sub_title'),
                  featureText: 'marketing_text.keyboard',
              },
              {
                  image: icons.transposeSftLanding,
                  title: translate('native.screen_sft.carousel.transpose_title'),
                  subTitle: translate('native.screen_sft.carousel.transpose_sub_title'),
                  featureText: 'marketing_text.transpose',
              },
              {
                  image: icons.songbookSftLanding,
                  title: translate('native.screen_sft.carousel.songbook_title'),
                  subTitle: translate('native.screen_sft.carousel.songbook_sub_title'),
                  featureText: 'marketing_text.songbook',
              },
              {
                  image: icons.autoScrollSftLanding,
                  title: translate('native.screen_sft.carousel.auto_scroll_title'),
                  subTitle: translate('native.screen_sft.carousel.auto_scroll_sub_title'),
                  featureText: 'marketing_text.auto_scroll',
              },
              {
                  image: icons.mixerSftLanding,
                  title: translate('native.screen_sft.carousel.mixer_title'),
                  subTitle: translate('native.screen_sft.carousel.mixer_sub_title'),
                  featureText: 'marketing_text.mixer',
              },
              {
                  image: icons.courseSftLanding,
                  title: translate('native.screen_sft.carousel.course_title'),
                  subTitle: translate('native.screen_sft.carousel.course_sub_title'),
                  featureText: 'courses',
              },
              {
                  image: icons.autoGradeUnFill,
                  title: translate('native.autograde.title'),
                  subTitle: translate('native.autograde.feature_subtitle'),
                  featureText: 'autograde',
              },
              ...(platform.isIos
                  ? [
                        {
                            image: icons.appleWatchIcon,
                            title: translate('native.apple_watch_control.title'),
                            subTitle: translate('native.apple_watch_control.feature_subtitle'),
                            featureText: 'apple_watch',
                        },
                    ]
                  : []),
              {
                  image: icons.moreSftLanding,
                  title: translate('native.screen_sft.carousel.more_title'),
                  subTitle: translate('native.screen_sft.carousel.more_sub_title'),
                  featureText: 'more',
              },
          ]
}

export const dotSize = layoutHelpers.getResponsiveSizeExtended(8)
