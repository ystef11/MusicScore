import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { FormField, FormTextInput, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type Props = {
    value: string
    onChange: (value: string) => void
    onFocus?: () => void
}

export const DescriptionInput = memo(({ value, onChange, onFocus }: Props) => {
    return (
        <FormField
            label={translate('native.make_public.description_label')}
            style={styles.container}
        >
            <FormTextInput
                value={value}
                onChangeText={onChange}
                onFocus={onFocus}
                placeholder={translate('native.make_public.description_placeholder')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.input}
            />
        </FormField>
    )
})

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginMd,
    },
    input: {
        minHeight: 100,
        alignItems: 'flex-start',
    },
})
