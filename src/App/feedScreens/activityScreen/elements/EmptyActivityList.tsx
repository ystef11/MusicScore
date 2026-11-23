import { ScrollView, StyleSheet } from 'react-native'

import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import EmptyList from '../../../Elements/emptyList/EmptyList'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
})

const EmptyActivityList = () => (
    <ScrollView contentContainerStyle={styles.container}>
        <EmptyList
            icon={icons.bellNotificationIcon}
            heading={translate('native.activity.empty_list.title')}
            subscription={translate('native.activity.empty_list.desc')}
        />
    </ScrollView>
)

export default EmptyActivityList
