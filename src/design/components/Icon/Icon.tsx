import { forwardRef, memo, type ReactNode } from 'react'
import { StyleProp, View, type ViewInstance, ViewStyle } from 'react-native'
import Svg from 'react-native-svg'

/**
 * Shape of every icon module generated into `@mu-native/icons` by `@muse/import-icons`
 * (see `icons.config.js`).
 */
export interface IconSource {
    readonly viewBox: string
    readonly content: ReactNode
}

export interface IconProps {
    readonly source: IconSource
    /** Icons are square by DS definition; the pack is drawn on a 20x20 grid. */
    readonly size?: number
    readonly tint?: string
    readonly testID?: string
    readonly nativeID?: string
    readonly style?: StyleProp<ViewStyle>
}

const DEFAULT_SIZE = 20

/**
 * A Muse icon-pack icon: monochrome, square, tintable. Colour always resolves through
 * `fill` (black when no `tint` is given) — pack icons never carry their own colours.
 *
 * Import each `source` from its own module (`@mu-native/icons/<name>`), never from the
 * `@mu-native/icons` barrel: Metro does not tree-shake, so the barrel bundles all 272
 * pack icons (measured on an iOS release bundle: 118,711 bytes via the barrel versus
 * 333 bytes imported directly).
 *
 * For non-icon SVG artwork (logos, illustrations, decorations) use `SvgAsset` instead.
 */
const Icon = (
    { source, size = DEFAULT_SIZE, tint, testID, nativeID, style }: IconProps,
    ref: any,
) => (
    <View
        ref={ref}
        testID={testID}
        accessibilityLabel={testID}
        nativeID={nativeID}
        pointerEvents="none"
        style={style}
    >
        <Svg viewBox={source.viewBox} width={size} height={size} fill={tint}>
            {source.content}
        </Svg>
    </View>
)

export default memo(forwardRef<ViewInstance, IconProps>(Icon))
