import { StyleSheet, View } from 'react-native'

import { BaseEmptyStateView } from '@mu-native/ds'
import { conversation } from '@mu-native/icons/conversation'
import { translate } from '@mu-native/locale'

export const EmptyListComponent = () => {
    return (
        <View style={styles.container}>
            <BaseEmptyStateView
                title={translate('native.comment.empty_title')}
                description={translate('native.comment.empty_description')}
                icon={conversation}
            />
        </View>
    )
}

// eslint-disable-next-line no-nested-ternary
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
})
