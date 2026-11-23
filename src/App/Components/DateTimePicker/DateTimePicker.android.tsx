import { uses24HourClock } from 'react-native-localize'

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

type TProps = {
    mode?: 'date' | 'time'
    onClose?: () => void
    value: Date
    onChange: (date: Date) => void
}

const DateTimePickerComponent = ({ mode, onClose, value, onChange }: TProps) => {
    const onChangeGlobally = (event: DateTimePickerEvent, selected?: Date) => {
        onClose?.()
        if (event.type === 'set' && selected) onChange(selected)
    }

    return (
        <DateTimePicker
            testID="Date-Time Picker"
            value={value}
            mode={mode ?? 'time'}
            is24Hour={uses24HourClock()}
            display="default"
            onChange={onChangeGlobally}
        />
    )
}

export default DateTimePickerComponent
