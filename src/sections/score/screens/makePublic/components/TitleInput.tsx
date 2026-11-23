import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { FormField, FormTextInput, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type Props = {
    value: string
    onChange: (value: string) => void
}

export const TitleInput = memo(({ value, onChange }: Props) => {
    return (
        <FormField
            label={translate('native.make_public.score_title_label')}
            style={styles.container}
        >
            <FormTextInput
                value={value}
                onChangeText={onChange}
                placeholder={translate('native.make_public.score_title_placeholder')}
            />
        </FormField>
    )
})

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginMd,
    },
})
