import { annotationThunks } from './annotationThunks.ts'
import { commonScoreThunks } from './commonScoreThunks.ts'
import { exportPdfThunks } from './exportPdfThunks.ts'
import { loadingThunks } from './loadingThunks.ts'
import { metronomeThunks } from './metronomeThunks.ts'
import { mixerThunks } from './mixerThunks.ts'
import { paginationThunks } from './paginationThunks.ts'
import { playbackThunks } from './playbackThunks.ts'
import { scoreMutationThunks } from './scoreMutationThunks.ts'
import { soundfontThunks } from './soundfontThunks.ts'

export const scoreThunks = {
    ...mixerThunks,
    ...paginationThunks,
    ...playbackThunks,
    ...scoreMutationThunks,
    ...metronomeThunks,
    ...exportPdfThunks,
    ...loadingThunks,
    ...soundfontThunks,
    ...commonScoreThunks,
    ...annotationThunks,
}
