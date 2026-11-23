import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useAppSafeArea(defaultInsets?: {
    bottom?: number
    top?: number
    left?: number
    right?: number
}) {
    const insets = useSafeAreaInsets()

    return {
        bottom: insets.bottom > 0 ? insets.bottom : defaultInsets?.bottom ?? 0,
        top: insets.top > 0 ? insets.top : defaultInsets?.top ?? 0,
        left: insets.left > 0 ? insets.left : defaultInsets?.left ?? 0,
        right: insets.right > 0 ? insets.right : defaultInsets?.right ?? 0,
    }
}
