import type { TQuizDto, TQuizSavedAnswerDto } from '@mu-native/api'

export type TQuizItemResponse = { answer_id: number; value: string }

export const enum QuizApi {
    iOS = 3,
    android = 2,
}

export const enum QuizApiData {
    iOS = 16,
    android = 25,
    tourUpdateQuiz = 214,
    iOSQuiz2024 = 281,
}

export type TQuizIds = 37 | 40 | 43 | 73 | 85 | 100 | 103

export type TQuizItemData = TQuizSavedAnswerDto

export const enum QuizTypes {
    Social = 'social',
    Question = 'question',
}

export type TQuizAnswers = Record<string, number[]>
export type TQuizData = { pages: { id: number }[] }

export type TQuizItem = {
    id: number
    oldId: number
    title: string
    gptTitle?: string
    value?: string
    isFirst?: boolean
    isSelected: boolean
    children?: string[]
    data?: null
    name?: string
}
export type TQuizFirstStepItem = {
    id: number
    title: string | null
    name?: string
    data: TQuizItem[]
}

export type TQuizDataItem = {
    id: number
    title: string
    answers: TQuizFirstStepItem[] | TQuizItem[]
    settings: string
    type: QuizTypes
    content?: string
    sub_title?: string
    image_top?: string
}

export type TTourQuizData = TQuizDto

export type TTourQuizDataNew = Record<number, TQuizDataItem>
