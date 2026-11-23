const notificationBell = 'Notification bell'
const museScoreLogo = 'MuseScore logo'
const recentlyViewedSection = 'Scores recently viewed section'
const recentlyViewedTitle = 'Scores recently viewed title'
const recentlyViewedItem = 'Scores recently viewed item'
const recentlyViewedFirstItem = `${recentlyViewedItem}_0`
const recentlyViewedList = 'Scores recently viewed list'
const recentlyViewedListFirstItem = `${recentlyViewedList}_item_0`
const selectedForYouTitle = 'Scores selected for you title'

// Score viewer controls
const scoreBack = 'Score back'
const scorePlay = 'Score play'
const scoreSettingsButton = 'Score settings button'
const scoreSettingsKeyboardToggle = 'Score settings keyboard toggle'
const scoreToolbarExpandButton = 'Score toolbar expand button'
const scoreToolbarMetronomeButton = 'Score toolbar metronome button'
const scoreMetronomeSwitch = 'Score metronome switch'
const scoreMetronomePrecountSwitch = 'Score metronome precount switch'
const scoreToolbarMixerButton = 'Score toolbar mixer button'
const scoreMixerPartSoloButton = (index: number) => `Score mixer part solo button_${index}`
const scoreSettingsHqSoundToggle = 'Score settings HQ sound toggle'
const scoreSettingsPageLayoutOption = (key: string) => `Score settings page layout option ${key}`
const scoreSettingsTransposeUpButton = 'Score settings transpose up button'
const scoreSettingsTransposeValue = 'Score settings transpose value'
const scoreSheetTitle = 'Score sheet title'
const scorePlayStatePlaying = 'score-play-button-state-playing'
const scorePlayStatePaused = 'score-play-button-state-paused'
const scorePlayProgressCircle = 'score-play-progress-circle'
const scoreRewind = 'Score rewind'
const scoreLoop = 'Score loop'
const scoreCursor = 'Score cursor'
const scoreFullscreen = 'Score fullscreen results-title'
// Close button of the score viewer onboarding tooltip (design-system TooltipContent)
const scoreOnboardingTooltipClose = 'Close tooltip button'
const searchNoResultsMessage = 'search-no-results-message'

// Numeric filter inputs (actually exist in FilterInstrumentsCount component)
const filterInstrumentCountFrom = 'Explore filter instrument count from'
const filterInstrumentCountTo = 'Explore filter instrument count to'

// Filter Modal and Actions
const filtersModal = 'Scores filters modal'
const filtersApplyButton = 'Scores filters apply button'
const filtersClearButton = 'Scores filters clear button'

// Using translated section names from UI: 'Instruments', 'Difficulty Level', etc.
const filterSectionId = (sectionName: string) => `Scores filter section ${sectionName}`
const filterOptionId = (sectionName: string, optionName: string) =>
    `Scores filter option ${sectionName} ${optionName}`
const filterShowMoreId = (sectionName: string) => `Scores filter show more ${sectionName}`
const filterGroupId = (groupName: string) => `Scores filter group ${groupName}`

// Search Empty State (No Results / 404 page)
const searchEmptyState = 'search-empty-state'
const searchNoResultsTitle = 'search-no-results-title'

// Score details bottom sheet elements
const scoreDetailsTitle = 'Score details title'
const scoreDetailsSaveConfirmationTitle = 'Score details save confirmation title'
const scoreDetailsSaveConfirmationTitleText = 'Score saved'
const scoreDetailsFavoriteButtonLiked = 'score-like-button-liked'
const scoreDetailsFavoriteButtonUnliked = 'score-like-button-unliked'
const scoreDetailsArtistName = 'Score details artist name'
const scoreDetailsButtonsCarousel = 'Score details buttons carousel'
const scoreDetailsDownloadButton = 'Score details download button'
const scoreDetailsSaveButton = 'Score details save button'
const scoreDetailsAddToSetButton = 'Score details add to set button'
const scoreDetailsRateButton = 'Score details rate button'
const scoreDetailsShareButton = 'Score details share button'
const scoreDetailsCommentsSection = 'Score details comments section'
const scoreDetailsDescription = 'Score details description'

// Score download sheet elements
const scoreDetailsDownloadSheetTitle = 'Score details download sheet title'
const scoreDetailsDownloadPdfButton = 'Score details download PDF button'
const scoreDetailsDownloadMidiButton = 'Score details download MIDI button'

// Premium upsell modals shown to non-pro users when they tap a gated feature
const scoreFeaturePaywallModal = 'Score feature paywall modal'
const scoreFeaturePaywallSheetHandle = 'Score feature paywall sheet handle'
const scoreFeaturePaywallSheetTitle = 'Score feature paywall sheet title'
const scoreFeaturePaywallContinueButton = 'Score feature paywall continue button'
const scoreFeaturePaywallTrialButton = 'Score feature paywall trial button'
const scoreFeaturePaywallBuyButton = 'Score feature paywall buy button'
const scoreBuyModal = 'Score buy modal'
const scoreBuyModalSheetHandle = 'Score buy modal sheet handle'
const scoreBuyModalSheetTitle = 'Score buy modal sheet title'

export const scoreTestIds = {
    notificationBell,
    museScoreLogo,
    recentlyViewedSection,
    recentlyViewedTitle,
    recentlyViewedItem,
    recentlyViewedFirstItem,
    recentlyViewedList,
    recentlyViewedListFirstItem,
    selectedForYouTitle,
    scoreBack,
    scorePlay,
    scoreSettingsButton,
    scoreSettingsKeyboardToggle,
    scoreToolbarExpandButton,
    scoreToolbarMetronomeButton,
    scoreMetronomeSwitch,
    scoreMetronomePrecountSwitch,
    scoreToolbarMixerButton,
    scoreMixerPartSoloButton,
    scoreSettingsHqSoundToggle,
    scoreSettingsPageLayoutOption,
    scoreSettingsTransposeUpButton,
    scoreSettingsTransposeValue,
    scoreSheetTitle,
    scorePlayStatePlaying,
    scorePlayStatePaused,
    scorePlayProgressCircle,
    scoreRewind,
    scoreLoop,
    scoreCursor,
    scoreFullscreen,
    scoreOnboardingTooltipClose,
    filterInstrumentCountFrom,
    filterInstrumentCountTo,
    filtersModal,
    filtersApplyButton,
    filtersClearButton,
    filterSectionId,
    filterOptionId,
    filterShowMoreId,
    filterGroupId,
    searchEmptyState,
    searchNoResultsTitle,
    searchNoResultsMessage,
    scoreDetailsTitle,
    scoreDetailsSaveConfirmationTitle,
    scoreDetailsSaveConfirmationTitleText,
    scoreDetailsFavoriteButtonLiked,
    scoreDetailsFavoriteButtonUnliked,
    scoreDetailsArtistName,
    scoreDetailsButtonsCarousel,
    scoreDetailsDownloadButton,
    scoreDetailsSaveButton,
    scoreDetailsAddToSetButton,
    scoreDetailsRateButton,
    scoreDetailsShareButton,
    scoreDetailsCommentsSection,
    scoreDetailsDescription,
    scoreDetailsDownloadSheetTitle,
    scoreDetailsDownloadPdfButton,
    scoreDetailsDownloadMidiButton,
    scoreFeaturePaywallModal,
    scoreFeaturePaywallSheetHandle,
    scoreFeaturePaywallSheetTitle,
    scoreFeaturePaywallContinueButton,
    scoreFeaturePaywallTrialButton,
    scoreFeaturePaywallBuyButton,
    scoreBuyModal,
    scoreBuyModalSheetHandle,
    scoreBuyModalSheetTitle,
}
