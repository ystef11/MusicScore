import { memo, useCallback, useMemo } from 'react'
import { ScrollView } from 'react-native'

import {
    nativeDismissFittedSheet,
    NativeBottomSheet,
    RadioButtonGroup,
    SheetTitle,
    TRadioButtonGroupItem,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import autogradeScreenStoreChunk, { getParts } from '../store/autogradeScreenStoreChunk.ts'
import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'

const AutogradePartSelectionContent = memo(() => {
    const inset = useAppSafeArea({ bottom: 32 })
    const [parts, activePart] = useValues([getParts, autogradeScreenStoreChunk.props.getActivePart])
    const actions = useActions({
        setActivePart: autogradeScreenThunks.setActivePart,
    })

    const choices: TRadioButtonGroupItem[] = useMemo(
        () => parts.map((part, index) => ({ key: `${index}`, title: part.partName })),
        [parts],
    )

    const onSelect = useCallback(
        (item: TRadioButtonGroupItem) => {
            actions.setActivePart(parseInt(item.key, 10))
            nativeDismissFittedSheet('autogradePartSheet')
        },
        [actions],
    )

    return (
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: inset.bottom }}>
            <SheetTitle title={translate('native.autograde.select_main_instrument')} />
            <RadioButtonGroup choices={choices} selectedKey={`${activePart}`} onSelect={onSelect} />
        </ScrollView>
    )
})

export const AutogradePartSelectionSheet = memo(() => (
    <NativeBottomSheet name="autogradePartSheet">
        <AutogradePartSelectionContent />
    </NativeBottomSheet>
))
