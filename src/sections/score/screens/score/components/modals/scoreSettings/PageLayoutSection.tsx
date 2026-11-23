import { NativeModules, Platform } from 'react-native'
import { memo, useCallback } from 'react'
import { View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import {
    globalStyles,
    ListSectionHeader,
    nativeDismissFittedSheet,
    RadioButtonGroup,
    TRadioButtonGroupItem,
} from '@mu-native/ds'
import { bookFormat } from '@mu-native/icons/bookFormat'
import { format9x16 } from '@mu-native/icons/format9x16'
import { horizontalDirection } from '@mu-native/icons/horizontalDirection'
import { verticalDirection } from '@mu-native/icons/verticalDirection'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { ScorePageLayoutOptionKey, scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import { checkPremiumThunk } from '../../../../../../../App/Controllers/ScoreActionsController.ts'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

type TPageLayoutOption = {
    key: ScorePageLayoutOptionKey
} & TRadioButtonGroupItem

const getUiChoices = (isPdf: boolean | undefined, isTablet: boolean): TPageLayoutOption[] => [
    {
        key: 'vertical',
        title: translate('native.score.layout_title_vertical'),
        icon: verticalDirection,
        testID: scoreTestIds.scoreSettingsPageLayoutOption('vertical'),
    },
    ...(isPdf
        ? []
        : [
              {
                  key: 'single-line',
                  title: translate('native.score.single_line'),
                  icon: horizontalDirection,
                  testID: scoreTestIds.scoreSettingsPageLayoutOption('single-line'),
              } as TPageLayoutOption,
          ]),
    {
        key: 'horizontal',
        title: isTablet
            ? translate('native.score.layout_title_horizontal')
            : translate('native.score.layout_title_portrait_view'),
        icon: isTablet ? bookFormat : format9x16,
        testID: scoreTestIds.scoreSettingsPageLayoutOption('horizontal'),
    },
]

const PageLayoutSection = () => {
    const score = useCurrentScore()
    const localPlayback = Platform.OS === 'android' && !!NativeModules.WebScoreSource && !score?.isPdf
    const hasBookLayout = platform.isTablet && (!platform.isAndroid || !!score?.isPdf)
    const [isPro, layoutType] = useValues([
        marketingStoreChunk.props.getIsPro,
        scoreStoreChunk.props.getPageLayoutType,
    ])
    const actions = useActions({
        setPageLayoutType: scoreThunks.setPageLayoutType,
        setMarketingFields: marketingStoreChunk.actions.setPartialFieldsCustom,
        checkPremiumThunk,
    })

    const onChange = useCallback(
        (item: TPageLayoutOption) => {
            if (item.key === 'single-line' || item.key === 'horizontal') {
                reportEvent(
                    item.key === 'single-line'
                        ? RT_EVENTS.SCORE_LANDSCAPE_VIEW_SINGLE_LINE_CLICK
                        : RT_EVENTS.SCORE_LANDSCAPE_VIEW_STANDARD_CLICK,
                    getScoreMetaEvent(score),
                )
                actions.setPageLayoutType(item.key)
            } else {
                if (!localPlayback && !isPro && !score?.isPurchased) {
                    actions.setMarketingFields({
                        source: sources.autoScroll,
                        inAppForSale: score,
                        featureText: 'marketing_text.auto_scroll',
                    })
                    nativeDismissFittedSheet('scoreSettingsSheet')
                    actions.checkPremiumThunk()
                    return
                }
                actions.setPageLayoutType(item.key)
            }
        },
        [actions, isPro, score, localPlayback],
    )

    return (
        <View style={globalStyles.mt20}>
            <ListSectionHeader title={translate('native.score.layout_title')} />
            <RadioButtonGroup<TPageLayoutOption>
                choices={getUiChoices(score?.isPdf, hasBookLayout)}
                selectedKey={layoutType}
                onSelect={onChange}
            />
        </View>
    )
}

export default memo(PageLayoutSection)
