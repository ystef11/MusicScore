import { memo } from 'react'

import { AuthModal, AuthTourModalContainer } from '@mu-native/auth'
import { AlertNotifications } from '@mu-native/ds'
import { EmailVerificationToastContainer } from '@mu-native/email-verification'
import { PlainModal } from '@mu-native/system'

export const AppModalsContainer = memo(() => {
    return (
        <>
            <AuthTourModalContainer />
            <AuthModal />
            <PlainModal />
            {/* Before AlertNotifications so transient toasts paint above the sticky one. */}
            <EmailVerificationToastContainer />
            <AlertNotifications />
        </>
    )
})
