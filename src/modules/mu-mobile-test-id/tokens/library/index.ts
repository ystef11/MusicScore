const librarySections = {
    favoritesScores: 'Library favorites scores',
    favoritesCourses: 'Library favorites courses',
    favoritesSongbooks: 'Library favorites songbooks',
    myScores: 'Library my scores',
    mySets: 'Library my sets',
    ordersScores: 'Orders scores',
    ordersCourses: 'Orders my courses',
    ordersEbooks: 'Orders songbooks',
    savedScores: 'Saved Scores',
}

const libraryNavigation = {
    favoritesBack: 'Favorites back',
    coursesBack: 'Courses back',
    ebooksBack: 'Ebooks back',
    myScoresBack: 'My scores back',
    mySetsBack: 'My sets back',
    songbookBack: 'Songbook back',
}

const libraryLists = {
    favoritesScoresList: 'Favorites scores list',
    coursesList: 'Courses list',
    ebooksFavoritesList: 'Ebooks favorites list',
    myScoresList: 'My scores list',
    mySetsList: 'My sets list',
    mySetsItem: (id: number | string) => `My sets item ${id}`,
}

const libraryComponents = {
    searchInput: 'Library search',
    scrollView: 'Library scroll view',
    recentFavoritesCarousel: 'Recent favorites carousel',
    restorePurchaseLink: 'Restore purchase link',
    restorePurchaseChecking: 'Restore purchase checking',
}

export const libraryTestIds = {
    sections: librarySections,
    navigation: libraryNavigation,
    lists: libraryLists,
    components: libraryComponents,
}
