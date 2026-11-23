// The bottom "Songbooks" tab renders the digital songbooks (ebooks) storefront
// (EbooksMainScreen → feed of songbook carousels → songbook details).
const searchInput = 'Ebooks search' // already wired in DigitalBooksSearchView

export const songbookTestIds = {
    // main (storefront) screen
    searchInput,
    // NavHeaderSearchBar derives the filter button id as `${testID} filter`
    searchFilterButton: `${searchInput} filter`,
    feedList: 'Songbooks feed list',
    feedSection: 'Songbooks feed section',
    feedSectionTitle: 'Songbooks feed section title',
    feedItem: 'Songbooks feed item',
    // details screen
    detailsScreen: 'Songbook details screen',
    detailsCover: 'Songbook details cover',
    detailsTitle: 'Songbook details title',
    detailsFavoriteButton: 'Songbook details favorite button',
    detailsRatingButton: 'Songbook details rating button',
    detailsShareButton: 'Songbook details share button',
    detailsDescription: 'Songbook details description',
    detailsIncludes: 'Songbook details includes',
    detailsInformation: 'Songbook details information',
    detailsReviews: 'Songbook details reviews',
    detailsSimilar: 'Songbook details similar',
}
