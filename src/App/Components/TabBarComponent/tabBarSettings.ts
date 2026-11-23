import { tabBarTestIds } from '@mu/mu-mobile-test-id'
import { IconSource } from '@mu-native/ds'
import { book } from '@mu-native/icons/book'
import { heartFilled } from '@mu-native/icons/heartFilled'
import { learn } from '@mu-native/icons/learn'
import { noteList } from '@mu-native/icons/noteList'
import { smartUploader } from '@mu-native/icons/smartUploader'
import { translate } from '@mu-native/locale'

type TabItem = {
    label: string
    icon: IconSource
    testID: string
    routeName: string
    clickCallback?: () => void
}

export const getTabBarRoutes = (): TabItem[] => {
    return [
        {
            label: translate('native.bottom_bar.scores_tab'),
            icon: noteList,
            testID: 'Tab bar explore',
            routeName: 'BrowseTab',
        },
        {
            label: translate('native.bottom_bar.courses_tab'),
            icon: learn,
            testID: 'Tab bar courses',
            routeName: 'LearnTab',
        },
        {
            label: translate('native.bottom_bar.add_scores_tab'),
            icon: smartUploader,
            testID: tabBarTestIds.addScores,
            routeName: 'OmrTab',
        },
        {
            label: translate('native.bottom_bar.books_tab'),
            icon: book,
            testID: 'Tab bar ebooks',
            routeName: 'EbooksTab',
        },
        {
            label: translate('native.bottom_bar.library_tab'),
            icon: heartFilled,
            testID: 'Tab bar library',
            routeName: 'LibraryTab',
        },
    ]
}
