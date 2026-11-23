const ctaButton = 'cta_button'
const title = 'title'
const subtitle = 'subtitle'
const closeButton = 'close_button'
const skipButton = 'skip_button'
const list = 'list_tour'
const listItemCheckBox = (index: number, isActive: boolean) => {
    return `list_item_checkbox_${index}_${isActive ? 1 : 0}`
}
const auth = {
    authByEmailButton: 'auth_by_email',
    authByAppleButton: 'auth_by_apple',
    authByGoggleButton: 'auth_by_google',
    authByFacebookButton: 'auth_by_facebook',
    termsLink: 'terms_link_text',
    privacyLink: 'privacy_link_text',
    authPopUp: {
        usernameField: 'username_filed',
        emailField: 'email_filed',
        passwordField: 'password_field',
        authorizeButton: 'authorize_button',
        switchAuthButton: 'switch_auth_button',
    },
}

const quizOption = (index: number) => `quiz_option_${index}`

const buttons = {
    continue: 'Tour install continue',
    benefitsContinue: 'Tour benefits continue',
    notificationContinue: 'Tour install notification continue',
    closeTrial: 'Tour install close trial',
    closePayment: 'close-payment-button',
    approveModalConfirm: 'Tour approve modal confirm',
    trialModalGotIt: 'Tour trial modal got it',
    featuresContinue: 'Tour features continue',
}

// Mid-tour sheet asking whether the user likes a given author.
const questionSheet = {
    no: 'Tour question sheet no',
    yes: 'Tour question sheet yes',
}

const tabs = {
    explore: 'Tab bar explore',
}

const text = {
    gotIt: 'Got it, thanks',
}

export const tourTestIds = {
    auth,
    ctaButton,
    title,
    subtitle,
    closeButton,
    skipButton,
    list,
    listItemCheckBox,
    quizOption,
    buttons,
    questionSheet,
    tabs,
    text,
}
