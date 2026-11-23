import { useCallback } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'

import { generalModule } from '@mu-native/common'
import { icons, Popover } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import {
    COLOR_DEEP_BLUE,
    COLOR_SILVER,
    COLOR_WHITE,
    MARGIN_LG,
    MARGIN_MD,
    MARGIN_SM,
    MARGIN_XM,
} from '../../constants/styles'
import LinkButton from '../../Elements/LinkButton'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 328,
        borderColor: COLOR_WHITE,
        borderWidth: 1,
        borderRadius: 12,
        elevation: 2,
    },
    descriptionContainer: {
        backgroundColor: COLOR_WHITE,
        paddingTop: MARGIN_MD,
        paddingBottom: MARGIN_XM,
        paddingHorizontal: MARGIN_LG,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        color: COLOR_DEEP_BLUE,
        marginBottom: MARGIN_XM,
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        color: COLOR_DEEP_BLUE,
    },
    imageContainer: {
        paddingHorizontal: MARGIN_LG,
        paddingTop: MARGIN_MD,
        backgroundColor: COLOR_SILVER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsContainer: {
        backgroundColor: COLOR_WHITE,
        paddingVertical: MARGIN_SM,
        paddingHorizontal: MARGIN_LG,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
})

const StoragePermissionModal = () => {
    const [isVisible] = useValues([scoreStoreChunk.props.getShowStoragePermissionModal])
    const actions = useActions({
        setShowStoragePermissionModal: scoreStoreChunk.actions.setShowStoragePermissionModal,
    })

    const onCloseModal = useCallback(() => actions.setShowStoragePermissionModal(false), [])
    const onOpenPermissionStorageSettings = useCallback(() => {
        actions.setShowStoragePermissionModal(false)
        generalModule.openPermissionStorageSettings()
    }, [])

    return (
        <Popover isVisible={isVisible} onRequestClose={onCloseModal}>
            <ScrollView style={styles.container}>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.title}>
                        {translate('native.permissions.storage.modal.title')}
                    </Text>
                    <Text style={styles.text}>
                        {translate('native.permissions.storage.modal.message')}
                    </Text>
                </View>
                <View style={styles.imageContainer}>
                    <Image source={icons.storageSettings} />
                </View>
                <View style={styles.buttonsContainer}>
                    <LinkButton
                        text={translate('native.permissions.storage.modal.cancel')}
                        onPress={onCloseModal}
                    />
                    <LinkButton
                        text={translate('native.permissions.storage.modal.settings')}
                        onPress={onOpenPermissionStorageSettings}
                    />
                </View>
            </ScrollView>
        </Popover>
    )
}

export default StoragePermissionModal
