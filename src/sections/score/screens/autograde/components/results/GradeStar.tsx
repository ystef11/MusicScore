import { brandColors, G, Path, Svg } from '@mu-native/ds'

import { toRadians } from '../../helpers/svgHelpers.ts'

type Props = {
    centerX: number
    centerY: number
    radius: number
    angle: number
    highlight: boolean
}

export const GradeStar = ({ centerX, centerY, radius, angle, highlight }: Props) => {
    const props = {
        fill: highlight ? '#1CE0FF' : brandColors.backgroundDefault,
        fillOpacity: highlight ? 1 : 0.2,
    } as const

    return (
        <G
            translateX={centerX - radius * Math.cos(toRadians(angle)) - 20}
            translateY={centerY + radius * Math.sin(toRadians(angle)) - 20}
        >
            <Svg width={40} height={40} viewBox="0 0 40 40">
                <Path
                    d="M19.5 0L24.3433 13.3337L38.5211 13.8197L27.3367 22.5463L31.2557 36.1803L19.5 28.24L7.7443 36.1803L11.6633 22.5463L0.47887 13.8197L14.6566 13.3337L19.5 0Z"
                    {...props}
                />
            </Svg>
        </G>
    )
}
