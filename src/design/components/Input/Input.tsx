import { Component } from 'react'
import { StyleSheet, TextInput, TextInputProps } from 'react-native'

import { colors } from '../../constants/colors'
import { brandColors } from '../../constants/new/brandColors.ts'

const styles = StyleSheet.create({
    input: {
        flex: 1,
        paddingLeft: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: colors.transparent,
        fontSize: 16,
        lineHeight: 20,
    },
})
type Props = {
    onBlur?: () => void
    onFocus?: () => void
    inputRef?: (ref: TextInput | null | undefined) => void
    value?: string
    placeholder?: string
    placeholderTextColor?: TextInputProps['placeholderTextColor']
    keyboardType?: TextInputProps['keyboardType']
    returnKeyType?: TextInputProps['returnKeyType']
    secureTextEntry?: boolean
    multiline?: boolean
    testID?: string
    style?: TextInputProps['style']
    onChangeText?: TextInputProps['onChangeText']
    onSubmitEditing?: TextInputProps['onSubmitEditing']
}
type State = {
    isFocused: boolean
}

export class Input extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isFocused: false,
        }
    }

    onFocus = () => {
        const { onFocus } = this.props
        this.setState({ isFocused: true }, () => onFocus?.())
    }

    onBlur = () => {
        const { onBlur } = this.props
        this.setState({ isFocused: false }, () => onBlur?.())
    }

    getStyles = (isFocused: boolean) => {
        if (isFocused) {
            return [
                styles.input,
                {
                    borderColor: '#1F74BD',
                },
                this.props.style,
            ]
        }

        return [styles.input, this.props.style]
    }

    render() {
        const { isFocused } = this.state
        const {
            value,
            onChangeText,
            placeholder,
            placeholderTextColor,
            keyboardType,
            returnKeyType,
            secureTextEntry,
            multiline,
            testID,
            onSubmitEditing,
            inputRef,
        } = this.props
        const style = this.getStyles(isFocused)
        return (
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                returnKeyType={returnKeyType}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                testID={testID}
                placeholderTextColor={placeholderTextColor ?? brandColors.formDefault}
                ref={inputRef as any}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                // https://github.com/facebook/react-native/issues/39411#issuecomment-1744962420
                autoCorrect={false}
                onSubmitEditing={onSubmitEditing}
                style={style}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                disableFullscreenUI
            />
        )
    }
}
