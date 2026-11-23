import { BrandDesignExperimentTypes } from '@mu-native/ab'
import { AppText } from '@mu-native/ds'

import Label from '../../../Elements/Label'

type Props = {
    isPro: boolean | undefined
    blocked?: boolean
    experiment: BrandDesignExperimentTypes | undefined
}

export const ProLabel = ({ isPro, blocked, experiment = 'A' }: Props) => {
    if (!isPro) return null

    if (experiment === 'A') {
        return <Label theme={blocked ? 'blocked' : 'pro'} size="small" text="Pro" />
    }

    return <AppText rawText={`  PRO`} brandColor="statusSuccess" font="f11w500" />
}

export default ProLabel
