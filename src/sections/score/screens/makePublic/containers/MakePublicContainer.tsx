import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Alert,
    findNodeHandle,
    ScrollView,
    type ScrollViewInstance,
    StyleSheet,
    UIManager,
    View,
    type ViewInstance,
} from 'react-native'

import {
    AppText,
    BrandSwitcherListCell,
    colors,
    globalStyles,
    layout,
    MuseButton,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useNavigation } from '@react-navigation/native'
import { useActions, useValues } from '@ug/store'

import KeyboardAvoidingView from '../../../../../App/Components/KeyboardAvoidingView/KeyboardAvoidingView.tsx'
import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import reportEvent from '../../../../../App/Utils/Analytics'
import { AccessRow } from '../components/AccessRow.tsx'
import { BasedOnToggleRow } from '../components/BasedOnToggleRow.tsx'
import { CompositionInput } from '../components/CompositionInput.tsx'
import { CopyrightRow } from '../components/CopyrightRow.tsx'
import { DescriptionInput } from '../components/DescriptionInput.tsx'
import { GenreSelector } from '../components/GenreSelector.tsx'
import { TitleInput } from '../components/TitleInput.tsx'
import { type ApiSongResult } from '../services/makePublicApi.ts'
import makePublicStoreChunk, { type MakePublicPlacement } from '../store/makePublicStoreChunk.ts'
import {
    loadReferenceData,
    searchSongsByQuery,
    submitMakePublic,
} from '../store/makePublicThunkActions.ts'

export const MakePublicContainer = () => {
    const route = useAppRoute<{
        score: MSScoreT
        preserveMetadata?: boolean
        placement?: MakePublicPlacement
    }>()
    const navigation = useAppNavigation()
    const rawNavigation = useNavigation()
    const scrollRef = useRef<ScrollViewInstance>(null)
    const descriptionRef = useRef<ViewInstance>(null)
    const isDirtyRef = useRef(false)
    const [compositionError, setCompositionError] = useState<string | null>(null)

    const actions = useActions({
        ...makePublicStoreChunk.actions,
        submitMakePublic,
        loadReferenceData,
        searchSongsByQuery,
    })

    const [
        access,
        basedOnExisting,
        composition,
        title,
        genres,
        description,
        showParts,
        copyright,
        enableDownload,
        isSubmitting,
        isDirty,
        referenceGenres,
        songResults,
    ] = useValues([
        makePublicStoreChunk.props.getAccess,
        makePublicStoreChunk.props.getBasedOnExisting,
        makePublicStoreChunk.props.getComposition,
        makePublicStoreChunk.props.getTitle,
        makePublicStoreChunk.props.getGenres,
        makePublicStoreChunk.props.getDescription,
        makePublicStoreChunk.props.getShowParts,
        makePublicStoreChunk.props.getCopyright,
        makePublicStoreChunk.props.getEnableDownload,
        makePublicStoreChunk.props.getIsSubmitting,
        makePublicStoreChunk.props.getIsDirty,
        makePublicStoreChunk.props.getReferenceGenres,
        makePublicStoreChunk.props.getSongResults,
    ])

    const scoreMetaEvent = getScoreMetaEvent(route.score)

    useEffect(() => {
        if (route.preserveMetadata) {
            actions.initFromScoreMetadata(route.score)
        } else {
            actions.initFromScore(route.score)
        }
        if (route.placement) {
            actions.setPlacement(route.placement)
        }
        actions.loadReferenceData()
        return () => {
            actions.reset()
        }
    }, [])

    useEffect(() => {
        isDirtyRef.current = isDirty
    }, [isDirty])

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove' as any, (e: any) => {
            if (!isDirtyRef.current) return
            e.preventDefault()
            Alert.alert(
                translate('native.make_public.unsaved_title'),
                translate('native.make_public.unsaved_message'),
                [
                    { text: translate('native.make_public.unsaved_stay'), style: 'cancel' },
                    {
                        text: translate('native.make_public.unsaved_leave'),
                        style: 'destructive',
                        onPress: () => {
                            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_ABANDON, scoreMetaEvent)
                            rawNavigation.dispatch(e.data.action)
                        },
                    },
                ],
            )
        })
        return unsubscribe
    }, [navigation])

    const onCompositionChange = useCallback(
        (value: string) => {
            actions.setComposition(value)
            setCompositionError(null)
        },
        [actions],
    )

    const onSelectSong = useCallback(
        (song: ApiSongResult) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_SONG_SELECT, scoreMetaEvent)
            actions.selectSong(song)
            setCompositionError(null)
        },
        [actions, scoreMetaEvent],
    )

    const onBasedOnToggle = useCallback(
        (value: boolean) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_BASED_ON_TOGGLE, {
                ...scoreMetaEvent,
                'params.key': ['based_on_existing'],
                'params.str_value': [''],
                'params.value': [value ? 1 : 0],
            })
            actions.setBasedOnExisting(value)
        },
        [actions, scoreMetaEvent],
    )

    const onGenreChange = useCallback(
        (value: number[]) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_GENRE_CHANGE, scoreMetaEvent)
            actions.setGenres(value)
        },
        [actions, scoreMetaEvent],
    )

    const onShowPartsToggle = useCallback(
        (value: boolean) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_SHOW_PARTS_TOGGLE, {
                ...scoreMetaEvent,
                'params.key': ['show_parts'],
                'params.str_value': [''],
                'params.value': [value ? 1 : 0],
            })
            actions.setShowParts(value)
        },
        [actions, scoreMetaEvent],
    )

    const onEnableDownloadToggle = useCallback(
        (value: boolean) => {
            reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_DOWNLOAD_TOGGLE, {
                ...scoreMetaEvent,
                'params.key': ['enable_download'],
                'params.str_value': [''],
                'params.value': [value ? 1 : 0],
            })
            actions.setEnableDownload(value)
        },
        [actions, scoreMetaEvent],
    )

    const onDescriptionFocus = useCallback(() => {
        const scrollNode = findNodeHandle(scrollRef.current)
        const descNode = findNodeHandle(descriptionRef.current)
        if (scrollNode && descNode) {
            UIManager.measureLayout(
                descNode,
                scrollNode,
                () => {
                    /* noop */
                },
                (_x, y) => {
                    scrollRef.current?.scrollTo({ y, animated: true })
                },
            )
        }
    }, [])

    const onSubmit = useCallback(async () => {
        if (basedOnExisting && !composition.trim()) {
            setCompositionError(translate('native.make_public.composition_error'))
            return
        }
        const success = (await actions.submitMakePublic()) as unknown as boolean
        if (success) {
            isDirtyRef.current = false
            navigation.goBack()
        }
    }, [actions, basedOnExisting, composition, navigation])

    return (
        <KeyboardAvoidingView style={globalStyles.flex1}>
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <AccessRow access={access} />

                <BasedOnToggleRow value={basedOnExisting} onChange={onBasedOnToggle} />

                {basedOnExisting && (
                    <CompositionInput
                        value={composition}
                        onChange={onCompositionChange}
                        onSelectSong={onSelectSong}
                        onSearch={actions.searchSongsByQuery}
                        songResults={songResults}
                        error={compositionError}
                    />
                )}

                <TitleInput value={title} onChange={actions.setTitle} />

                <GenreSelector
                    genres={genres}
                    referenceGenres={referenceGenres}
                    onChange={onGenreChange}
                />

                <View ref={descriptionRef}>
                    <DescriptionInput
                        value={description}
                        onChange={actions.setDescription}
                        onFocus={onDescriptionFocus}
                    />
                </View>

                <View style={styles.toggleSection}>
                    <BrandSwitcherListCell
                        title={translate('native.make_public.show_parts')}
                        switchValue={showParts}
                        onSwitchChange={onShowPartsToggle}
                    />
                </View>

                <CopyrightRow copyright={copyright} />

                <View style={styles.toggleSection}>
                    <BrandSwitcherListCell
                        title={translate('native.make_public.enable_download')}
                        switchValue={enableDownload}
                        onSwitchChange={onEnableDownloadToggle}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <MuseButton
                        title={translate('native.make_public.update_button')}
                        onPress={onSubmit}
                        isLoading={isSubmitting}
                    />
                </View>

                <AppText
                    font="f11w400"
                    brandColor="contentSecondary"
                    rawText={translate('native.make_public.legal_text')}
                    style={styles.legalText}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        paddingBottom: 40,
    },
    toggleSection: {
        marginTop: layout.marginMd,
    },
    buttonContainer: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: layout.marginMd,
    },
    legalText: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: layout.marginMd,
    },
})
