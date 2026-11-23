import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { setTestIds } from '@mu/mu-mobile-test-id'
import {
    BrandCheckboxWithTitle,
    globalStyles,
    KeyboardSpacer,
    layout,
    MuseButton,
    staticSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_WHITE } from '../../../constants/styles'
import { MSScoreT } from '../../../Model/MSScore.ts'

import { BrandInputWithTitle } from './InputWithTitle.tsx'
import UserDnD from './UserDnD.tsx'

type TCreateEditSet = {
    editTitle: string
    editDescription: string
    isPrivate: boolean
    isLocal: boolean
    edit?: boolean
    onCreate: (title: string, description: string, is_private: boolean) => void
    onUpdate: (title: string, description: string, is_private: boolean) => void
    openRemoveModal: (item: MSScoreT) => void
    scores: MSScoreT[]
    setScores: (scores: MSScoreT[]) => void
    isChanging: boolean
}

export const CreateEditSetNew = ({
    editTitle,
    editDescription,
    isPrivate,
    isLocal,
    edit,
    onCreate,
    onUpdate,
    openRemoveModal,
    scores,
    setScores,
    isChanging,
}: TCreateEditSet) => {
    const [title, setTitle] = useState(editTitle)
    const [description, setDescription] = useState(editDescription)
    const [privateSet, setPrivate] = useState(isPrivate)
    useEffect(() => {
        setTitle(editTitle)
        setDescription(editDescription)
        setPrivate(isPrivate)
    }, [editTitle, editDescription, isPrivate])
    const disabled = isChanging || !title.trim()

    const onTogglePrivate = () => setPrivate(!privateSet)
    const onCreateEditSet = () => {
        if (disabled) return
        if (edit) onUpdate(title, description, privateSet)
        else onCreate(title, description, privateSet)
    }
    return (
        <View style={styles.base}>
            <UserDnD
                scores={scores && edit === true ? scores : []}
                setScores={setScores}
                openRemoveModal={openRemoveModal}
                style={globalStyles.flex1}
                containerStyle={styles.listContentContainer}
                ListHeaderComponent={
                    <View style={styles.wrapperContainer}>
                        <BrandInputWithTitle
                            testID={setTestIds.form.titleInput}
                            title={translate('native.sets.set_title')}
                            value={title}
                            placeholder={translate('native.sets.placeholder_title')}
                            setValue={setTitle}
                            small
                            autoFocus
                        />
                        <BrandInputWithTitle
                            title={translate('native.sets.set_description')}
                            value={description}
                            placeholder={translate('native.sets.placeholder_description')}
                            setValue={setDescription}
                        />
                        {!isLocal && (
                            <BrandCheckboxWithTitle
                                title={translate('native.sets.private')}
                                selected={privateSet}
                                onToggle={onTogglePrivate}
                            />
                        )}
                    </View>
                }
            />
            <MuseButton
                testID={setTestIds.form.createSaveButton}
                isLoading={isChanging}
                title={translate(
                    !edit ? 'native.sets.creating_new_set' : 'native.sets.save_changes',
                )}
                onPress={onCreateEditSet}
                disabled={disabled}
            />
            <KeyboardSpacer
                openedSpacing={8}
                defaultBottomSpacing={staticSafeArea().bottomWithAndroid}
            />
        </View>
    )
}
CreateEditSetNew.displayName = 'CreateEditSetNew'

const styles = StyleSheet.create({
    base: {
        flex: 1,
        paddingHorizontal: layout.baseMarginFromEdges,
        backgroundColor: COLOR_WHITE,
    },

    listContentContainer: {
        paddingBottom: 8,
    },

    wrapperContainer: {
        alignItems: 'center',
        paddingBottom: 0,
        rowGap: 16,
    },
})
