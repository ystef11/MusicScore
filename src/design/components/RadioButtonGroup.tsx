import RadioButton from '../elements/RadioButton.tsx'

import { type IconSource } from './Icon/Icon'

export type TRadioButtonGroupItem = {
    key: string
    title: string
    disabled?: boolean
    icon?: IconSource
    testID?: string
}

type TRadioButtonGroupProps<T extends TRadioButtonGroupItem> = {
    choices: T[]
    selectedKey: T['key']
    onSelect?: (item: T) => void
}

const RadioButtonGroup = <T extends TRadioButtonGroupItem>({
    choices,
    selectedKey,
    onSelect,
}: TRadioButtonGroupProps<T>) => {
    return (
        <>
            {choices.map((choice: T) => {
                const { title, key, disabled } = choice
                return (
                    <RadioButton
                        title={title}
                        key={key}
                        disabled={disabled}
                        selected={selectedKey === key}
                        icon={choice.icon}
                        onPress={() => onSelect?.(choice)}
                        testID={choice.testID}
                    />
                )
            })}
        </>
    )
}

export default RadioButtonGroup
