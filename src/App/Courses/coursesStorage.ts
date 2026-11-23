import { createStorage } from '@muse-native/mmkv'

export type TCoursesStorage = {
    [key in `sentFeedback${string}`]: string
}

export const coursesStorage = createStorage<TCoursesStorage>()
