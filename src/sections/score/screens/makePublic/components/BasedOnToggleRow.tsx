import { memo } from 'react'

import { BrandSwitcherListCell } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type Props = {
    value: boolean
    onChange: (value: boolean) => void
}

export const BasedOnToggleRow = memo(({ value, onChange }: Props) => {
    return (
        <BrandSwitcherListCell
            title={translate('native.make_public.based_on_toggle')}
            subtitle={translate('native.make_public.based_on_toggle_subtitle')}
            switchValue={value}
            onSwitchChange={onChange}
        />
    )
})
