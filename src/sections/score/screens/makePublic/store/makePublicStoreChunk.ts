import { createExtendedStoreChunk } from '@ug/store'

import { type MSScoreT, ScorePrivacy, type ScorePrivacyValue } from '../../../../../App/Model/MSScore.ts'
import { type CopyrightOption } from '../constants.ts'
import { type ApiGenre, type ApiSongResult } from '../services/makePublicApi.ts'

const REVERSE_LICENSE_MAP: Record<string, CopyrightOption> = {
    'all-rights-reserved': 'all_rights_reserved',
    'cc-by': 'cc_by',
    'cc-by-nd': 'cc_by_nd',
    'cc-by-sa': 'cc_by_sa',
    'cc-by-nc': 'cc_by_nc',
    'cc-by-nc-nd': 'cc_by_nc_nd',
    'cc-by-nc-sa': 'cc_by_nc_sa',
    'cc-zero': 'cc_zero',
}

export type MakePublicPlacement =
    | 'my_scores'
    | 'score_details'
    | 'score_details_share'
    | 'description_modal'

export type TMakePublicState = {
    scoreId: number | null
    placement: MakePublicPlacement | null
    access: ScorePrivacyValue
    basedOnExisting: boolean
    composition: string
    songId: number | null
    title: string
    genres: number[]
    description: string
    showParts: boolean
    copyright: CopyrightOption
    enableDownload: boolean
    isSubmitting: boolean
    isLoadingReference: boolean
    error: string | null
    isDirty: boolean
    referenceGenres: ApiGenre[]
    songResults: ApiSongResult[]
}

const initialState: TMakePublicState = {
    scoreId: null,
    placement: null,
    access: ScorePrivacy.PUBLIC,
    basedOnExisting: true,
    composition: '',
    songId: null,
    title: '',
    genres: [],
    description: '',
    showParts: true,
    copyright: 'all_rights_reserved',
    enableDownload: true,
    isSubmitting: false,
    isLoadingReference: false,
    error: null,
    isDirty: false,
    referenceGenres: [],
    songResults: [],
}

const makePublicStoreChunk = createExtendedStoreChunk<TMakePublicState>({
    treeKey: 'screens',
    storeKey: 'makePublic',
})({
    initialState,
    actions: {
        initFromScore: (score: MSScoreT) => ({
            scoreId: score.id,
            title: score.title,
            description: score.description || '',
            isDirty: false,
            error: null,
        }),
        initFromScoreMetadata: (score: MSScoreT) => ({
            scoreId: score.id,
            title: score.title,
            description: score.description || '',
            access: (score.privacy ?? ScorePrivacy.PUBLIC) as ScorePrivacyValue,
            copyright: REVERSE_LICENSE_MAP[score.license] ?? 'all_rights_reserved',
            basedOnExisting: !score.isOrigin,
            composition: score.songName || '',
            songId: score.songId || null,
            genres: score.genres?.map(g => Number(g.id)).filter(Boolean) ?? [],
            isDirty: false,
            error: null,
        }),
        setPlacement: (placement: MakePublicPlacement | null) => ({ placement }),
        reset: () => initialState,
        setAccess: (access: ScorePrivacyValue) => ({ access, isDirty: true }),
        setBasedOnExisting: (basedOnExisting: boolean) => ({
            basedOnExisting,
            songId: null,
            composition: '',
            isDirty: true,
        }),
        setComposition: (composition: string) => ({ composition, songId: null, isDirty: true }),
        selectSong: (song: ApiSongResult) => ({
            composition: song.name,
            songId: song.id,
            isDirty: true,
        }),
        setTitle: (title: string) => ({ title, isDirty: true }),
        setGenres: (genres: number[]) => ({ genres, isDirty: true }),
        setDescription: (description: string) => ({ description, isDirty: true }),
        setShowParts: (showParts: boolean) => ({ showParts, isDirty: true }),
        setCopyright: (copyright: CopyrightOption) => ({ copyright, isDirty: true }),
        setEnableDownload: (enableDownload: boolean) => ({ enableDownload, isDirty: true }),
    },
})

export default makePublicStoreChunk
