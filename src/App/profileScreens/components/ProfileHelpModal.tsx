import { StyleSheet } from 'react-native'

import { layout, Popover } from '@mu-native/ds'

import { EmailInput } from '../elements/EmailInput'
import { HelpModeSelection } from '../elements/HelpModeSelection'

export const styles = StyleSheet.create({
    popover: {
        borderRadius: 8,
        maxWidth: layout.maxWidthTabletContainer,
        ...layout.shadowElevation(4),
    },
})

const displayAreaInsets = {
    left: layout.marginXl,
    right: layout.marginXl,
}

type TProps = {
    isVisible: boolean
    onClose: () => void
    onSubmit: (email: string) => void
    showConversations: () => void
    showHelpCenter: () => void
    emailRequired: boolean
}

const ProfileHelpModal = ({
    isVisible,
    onClose,
    onSubmit,
    showConversations,
    showHelpCenter,
    emailRequired,
}: TProps) => {
    const renderItem = () =>
        emailRequired ? (
            <EmailInput onSubmit={onSubmit} />
        ) : (
            <HelpModeSelection
                showHelpCenter={showHelpCenter}
                showConversations={showConversations}
            />
        )

    return isVisible ? (
        <Popover
            isVisible={isVisible}
            onRequestClose={onClose}
            popoverStyle={styles.popover}
            displayAreaInsets={displayAreaInsets}
        >
            {renderItem()}
        </Popover>
    ) : null
}

export default ProfileHelpModal
