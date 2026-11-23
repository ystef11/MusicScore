import { memo } from 'react'
import { View } from 'react-native'

import { Badge } from '../../elements/Badge/Badge'

type TBadgeProps = {
    translateX?: number
    translateY?: number
    color?: string
    isShow?: boolean
    children: React.ReactNode
}

export const BadgeWrapper = memo(({ children, isShow = true, ...badgeProps }: TBadgeProps) => (
    <View>
        {isShow && <Badge {...badgeProps} />}
        {children}
    </View>
))
