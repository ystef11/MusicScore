import { StyleSheet } from 'react-native'

import { translate } from '@mu-native/locale/i18n'

import { BrandThemeColorKey } from '../../constants/new/brandColors.ts'
import { AppBadge } from '../AppBadge.tsx'

type Complexity = 0 | 1 | 2 | 3 | 4

type TProps = {
    complexity: Complexity
}

export const getScoreComplexity = (complexity: Complexity) => {
    if (complexity === 1) return translate('native.score_details_sheet.complexity.beginner')
    if (complexity === 2) return translate('native.score_details_sheet.complexity.intermediate')
    if (complexity === 3) return translate('native.score_details_sheet.complexity.advanced')
    if (complexity === 4) return translate('native.score_details_sheet.complexity.all_levels')
    if (complexity === 0) return translate('native.score_details_sheet.complexity.all_levels')
    return ''
}

const COMPLEXITY_COLORS: Record<
    Exclude<Complexity, 0>,
    { background: BrandThemeColorKey; text: BrandThemeColorKey }
> = {
    1: { background: 'additionalBeginnerSubdued', text: 'additionalBeginner' },
    2: { background: 'additionalIntermediateSubdued', text: 'additionalIntermediate' },
    3: { background: 'additionalAdvancedSubdued', text: 'additionalAdvanced' },
    4: { background: 'backgroundHighlight', text: 'contentPrimary' },
}

export const BadgeComplexity = ({ complexity }: TProps) => {
    if (complexity === 0) return null

    const badgeColors = COMPLEXITY_COLORS[complexity]

    return (
        <AppBadge
            title={getScoreComplexity(complexity)}
            backgroundColor={badgeColors.background}
            textColor={badgeColors.text}
            style={styles.badge}
        />
    )
}

const styles = StyleSheet.create({
    badge: {
        maxWidth: 116,
    },
})
