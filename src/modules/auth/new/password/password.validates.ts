import { PasswordRuleTypes } from './PasswordRulesView'

export const handlePasswordValidateNumbers = (value: string) => {
    const newValue = value.split(/[0-9]/).join('')
    const length = value.length - newValue.length
    return length > 0
}

const handlePasswordValidateUpperCase = (value: string) => {
    const newValue = value.split(/[A-Z]/).join('')
    const length = value.length - newValue.length
    return length > 0
}

const handlePasswordValidateLowerCase = (value: string) => {
    const newValue = value.split(/[a-z]/).join('')
    const length = value.length - newValue.length
    return length > 0
}

const handlePasswordValidateCharacters = (value: string) => {
    let newValue = value.split(/\W/).join('')
    newValue = newValue.split(/_/).join('')
    const length = value.length - newValue.length
    return length > 0
}

export function validatePasswordRules(password: string) {
    return {
        passwordLength: password.length >= 8,
        passwordNumber: handlePasswordValidateNumbers(password),
        passwordLowerCase: handlePasswordValidateLowerCase(password),
        passwordSpecialCharacters: handlePasswordValidateCharacters(password),
        passwordUpperCase: handlePasswordValidateUpperCase(password),
    }
}

export function passwordStrongType(
    validates: Record<PasswordRuleTypes, boolean | undefined>,
): 'weak' | 'normal' | 'strong' {
    if (!validates.passwordLength) return 'weak'
    const contents = [
        validates.passwordLowerCase,
        validates.passwordUpperCase,
        validates.passwordNumber,
        validates.passwordSpecialCharacters,
    ]
    const completed = contents.filter(c => c)
    if (completed.length < 2) return 'weak'
    if (completed.length >= 4) return 'strong'
    if (completed.length >= 2) return 'normal'

    return 'weak'
}
