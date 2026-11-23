import { memo } from 'react'

import { FilterItemCheck, FilterItemRadio, globalStyles } from '@mu-native/ds'

type Props = {
    text: string
    onPress?: () => void
    selected: boolean
    testID?: string
    box?: boolean
}

const ActionSheetListItem = ({ text, onPress, selected, testID, box }: Props) => {
    if (!box) {
        return (
            <FilterItemRadio
                testID={testID}
                style={globalStyles.mh16}
                id=""
                onPress={() => onPress?.()}
                name={text}
                selected={selected}
            />
        )
    }

    return (
        <FilterItemCheck
            testID={testID}
            style={globalStyles.mh16}
            id=""
            hideCount={false}
            onPress={() => onPress?.()}
            name={text}
            selected={selected}
        />
    )
}

export default memo(ActionSheetListItem, (prevProps, nextProps) => {
    return prevProps.selected === nextProps.selected
})
