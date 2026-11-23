import { platform } from '@mu-native/common/constants/platform'

const { isIos } = platform

export const icons = {
    chat: {
        uri: isIos ? 'chat.png' : 'asset:/custom/chat.png',
    },
    searchIcon: {
        uri: isIos ? 'search.png' : 'asset:/custom/search.png',
    },
    cursor: {
        uri: isIos ? 'score_cursor.png' : 'asset:/custom/score_cursor.png',
    },
    attention: {
        uri: isIos ? 'attention.png' : 'asset:/custom/attention.png',
    },
    starIcon: {
        uri: isIos ? 'icon_star_filled.png' : 'asset:/custom/icon_star_filled.png',
    },
    shareIos: {
        uri: isIos ? 'share_ios_design.png' : 'asset:/custom/share_ios_design.png',
    },
    chevronDownIcon: {
        uri: isIos ? 'chevron_down.png' : 'asset:/custom/chevron_down.png',
    },
    iconAnswer: {
        uri: isIos ? 'reply.png' : 'asset:/custom/reply.png',
    },
    likeIcon: {
        uri: isIos ? 'like.png' : 'asset:/custom/like.png',
    },
    bellNotificationIcon: {
        uri: isIos ? 'bell.png' : 'asset:/custom/bell.png',
    },
    radioButtonIcon: {
        uri: isIos ? 'radiobutton.png' : 'asset:/custom/radiobutton.png',
    },
    // courses
    sendIcon: {
        uri: isIos ? 'paperplane.png' : 'asset:/custom/paperplane.png',
    },
    feedback1: {
        uri: isIos ? 'feedback1.png' : 'asset:/custom/feedback1.png',
    },
    feedback2: {
        uri: isIos ? 'feedback2.png' : 'asset:/custom/feedback2.png',
    },
    feedback3: {
        uri: isIos ? 'feedback3.png' : 'asset:/custom/feedback3.png',
    },
    feedback4: {
        uri: isIos ? 'feedback4.png' : 'asset:/custom/feedback4.png',
    },
    feedback5: {
        uri: isIos ? 'feedback5.png' : 'asset:/custom/feedback5.png',
    },
    // library
    myScoresIcon: {
        uri: isIos ? 'cloud.png' : 'asset:/custom/cloud.png',
    },
    setsIcon: {
        uri: isIos ? 'my_sets.png' : 'asset:/custom/my_sets.png',
    },
    // empty
    // score page
    scoreFullscreen: {
        uri: isIos ? 'expand.png' : 'asset:/custom/expand.png',
    },
    autoGrade: {
        uri: isIos ? 'auto_grade.png' : 'asset:/custom/auto_grade.png',
    },
    museScore2: {
        uri: isIos ? 'muse_score_2.png' : 'asset:/custom/muse_score_2.png',
    },
    iosBackIcon: {
        uri: isIos ? 'ios_back_icon.png' : 'asset:/custom/ios_back_icon.png',
    },
    musescoreLogo: {
        uri: isIos ? 'musescore_logo.png' : 'asset:/custom/musescore_logo.png',
    },
    autogradePitch: {
        uri: isIos ? 'autograde_pitch.png' : 'asset:/custom/autograde_pitch.png',
    },
    autogradeRhythm: {
        uri: isIos ? 'autograde_rhythm.png' : 'asset:/custom/autograde_rhythm.png',
    },
    autogradeCropHandle: {
        uri: isIos ? 'crop_handle.png' : 'asset:/custom/crop_handle.png',
    },

    // Ebooks
    ebooksBooks: {
        uri: isIos ? 'ebooks_books.png' : 'asset:/custom/ebooks_books.png',
    },
    ebooksWave: {
        uri: isIos ? 'ebooks_wave.png' : 'asset:/custom/ebooks_wave.png',
    },
    autoGradeUnFill: {
        uri: isIos ? 'auto_grade_un_fill.png' : 'asset:/custom/auto_grade_un_fill.png',
    },
    appleWatchIcon: {
        uri: isIos ? 'apple_watch_icon.png' : 'asset:/custom/apple_watch_icon.png',
    },
    museLogoNew: {
        uri: isIos ? 'muse_logo_new.png' : 'asset:/custom/muse_logo_new.png',
    },
    bug: {
        uri: isIos ? 'bug_design.png' : 'asset:/custom/bug_design.png',
    },
    copy: {
        uri: isIos ? 'copy_design.png' : 'asset:/custom/copy_design.png',
    },
    tourInstallFirstStep: {
        uri: isIos ? 'tour_first_step_bg.png' : 'asset:/custom/tour_first_step_bg.png',
    },
    setNotificationToPlayImage: {
        uri: isIos
            ? 'setNotificationToPlayImage.png'
            : 'asset:/custom/setNotificationToPlayImage.png',
    },
    successScreenWaves: {
        uri: isIos ? 'success_screen_waves.png' : 'asset:/custom/success_screen_waves.png',
    },
    timerIcon: {
        uri: isIos ? 'timerIcon.png' : 'asset:/custom/timerIcon.png',
    },
    fancyNoteHeads: {
        uri: isIos ? 'fancyNoteHeads.png' : 'asset:/custom/fancyNoteHeads.png',
    },
    pinata: {
        uri: isIos ? 'pinata.png' : 'asset:/custom/pinata.png',
    },
    confetti: {
        uri: isIos ? 'confetti.png' : 'asset:/custom/confetti.png',
    },
    tourBellModal: {
        uri: isIos ? 'bell_new_design.png' : 'asset:/custom/bell_new_design.png',
    },
    tourLikeModal: {
        uri: isIos ? 'like_tour.png' : 'asset:/custom/like_tour.png',
    },
    tourLockFile: {
        uri: isIos ? 'lockTour.png' : 'asset:/custom/lockTour.png',
    },
    tourStar: {
        uri: isIos ? 'star.png' : 'asset:/custom/star.png',
    },
    tourGreenGradient: {
        uri: isIos ? 'green_gradient.png' : 'asset:/custom/green_gradient.png',
    },
    closeIcon: {
        uri: isIos ? 'close_design.png' : 'asset:/custom/close_design.png',
    },
    anniversarySplashLogo: {
        uri: isIos ? 'anniversary_splash.png' : 'asset:/custom/anniversary_splash.png',
    },
    minusMd: {
        uri: isIos ? 'minus_md.png' : 'asset:/custom/minus_md.png',
    },
    closeMd: {
        uri: isIos ? 'close_md.png' : 'asset:/custom/close_md.png',
    },
    downLoadMd: {
        uri: isIos ? 'download.png' : 'asset:/custom/download.png',
    },
    nodeMd: {
        uri: isIos ? 'note_md.png' : 'asset:/custom/note_md.png',
    },
    markCircle: {
        uri: isIos ? 'mark_circle.png' : 'asset:/custom/mark_circle.png',
    },
    arrowForwardXs: {
        uri: isIos ? 'arrow_forward_xs.png' : 'asset:/custom/arrow_forward_xs.png',
    },
    radioButtonSplash: {
        uri: isIos ? 'radio_button_splash.png' : 'asset:/custom/radio_button_splash.png',
    },
    pdfSftLanding: {
        uri: isIos ? 'pdf_no_landing.png' : 'asset:/custom/pdf_no_landing.png',
    },
    keyboardSftLanding: {
        uri: isIos ? 'keyboard_no_landing.png' : 'asset:/custom/keyboard_no_landing.png',
    },
    transposeSftLanding: {
        uri: isIos ? 'transpose_no_landing.png' : 'asset:/custom/transpose_no_landing.png',
    },
    songbookSftLanding: {
        uri: isIos ? 'songbook_no_landing.png' : 'asset:/custom/songbook_no_landing.png',
    },
    mixerSftLanding: {
        uri: isIos ? 'mixer_no_landing.png' : 'asset:/custom/mixer_no_landing.png',
    },
    autoScrollSftLanding: {
        uri: isIos ? 'auto-scroll_no_landing.png' : 'asset:/custom/auto-scroll_no_landing.png',
    },
    moreSftLanding: {
        uri: isIos ? 'more_no_landing.png' : 'asset:/custom/more_no_landing.png',
    },
    courseSftLanding: {
        uri: isIos ? 'course_no_landing.png' : 'asset:/custom/course_no_landing.png',
    },
    currentCourseSftLanding: {
        uri: isIos
            ? 'current_course_no_landing.png'
            : 'asset:/custom/current_course_no_landing.png',
    },
    downloadSftLanding: {
        uri: isIos ? 'download_no_landing.png' : 'asset:/custom/download_no_landing.png',
    },
    iosCheck: {
        uri: isIos ? 'ios_check.png' : 'asset:/custom/ios_check.png',
    },
    museScore: {
        uri: isIos ? 'musescore.png' : 'asset:/custom/musescore.png',
    },
    iosArrowRight: {
        uri: isIos ? 'ios_arrow_right.png' : 'asset:/custom/ios_arrow_right.png',
    },
    iosForwardIcon: {
        uri: isIos ? 'ios_forward_icon.png' : 'asset:/custom/ios_forward_icon.png',
    },
    favorite: {
        uri: isIos ? 'favorite.png' : 'asset:/custom/favorite.png',
    },
    searchMd: {
        uri: isIos ? 'search_md.png' : 'asset:/custom/search_md.png',
    },
    eye: {
        uri: isIos ? 'eye.png' : 'asset:/custom/eye.png',
    },
    message: {
        uri: isIos ? 'message.png' : 'asset:/custom/message.png',
    },
    pause: {
        uri: isIos ? 'pause.png' : 'asset:/custom/pause.png',
    },
    playCourses: {
        uri: isIos ? 'play_courses.png' : 'asset:/custom/play_courses.png',
    },
    fullscreen: {
        uri: isIos ? 'fullscreen.png' : 'asset:/custom/fullscreen.png',
    },
    settings: {
        uri: isIos ? 'settings.png' : 'asset:/custom/settings.png',
    },
    fullscreenOut: {
        uri: isIos ? 'fullscreen_out.png' : 'asset:/custom/fullscreen_out.png',
    },
    rewindBack: {
        uri: isIos ? 'rewind-back.png' : 'asset:/custom/rewind-back.png',
    },
    rewindForward: {
        uri: isIos ? 'rewind-forward.png' : 'asset:/custom/rewind-forward.png',
    },
    skipRight: {
        uri: isIos ? 'skip-right.png' : 'asset:/custom/skip-right.png',
    },
    storageSettings: {
        uri: isIos ? 'storage_settings.png' : 'asset:/custom/storage_settings.png',
    },
    userAdd: {
        uri: isIos ? 'user_add.png' : 'asset:/custom/user_add.png',
    },
    facebookIcon: {
        uri: isIos ? 'facebook.png' : 'asset:/custom/facebook.png',
    },
    envelopeIcon: {
        uri: isIos ? 'envelope.png' : 'asset:/custom/envelope.png',
    },
    googleIcon: {
        uri: isIos ? 'google.png' : 'asset:/custom/google.png',
    },
    appleIcon: {
        uri: isIos ? 'apple.png' : 'asset:/custom/apple.png',
    },
    iconEmpty: {
        uri: isIos ? 'empty.png' : 'asset:/custom/empty.png',
    },
    iconTrashSecond: {
        uri: isIos ? 'icon-trash.png' : 'asset:/custom/icon-trash.png',
    },
    iconPositionArrow: {
        uri: isIos ? 'position_arrows.png' : 'asset:/custom/position_arrows.png',
    },
    iconCloseSecond: {
        uri: isIos ? 'icon-close.png' : 'asset:/custom/icon-close.png',
    },
    flashSaleBg: {
        uri: isIos ? 'flash_sale_bg.png' : 'asset:/custom/flash_sale_bg.png',
    },
    blueStar: {
        uri: isIos ? 'blue_star.png' : 'asset:/custom/blue_star.png',
    },
    scoreImage: {
        uri: isIos ? 'score-image.png' : 'asset:/custom/score-image.png',
    },
    timerTour: {
        uri: isIos ? 'timer_tour.png' : 'asset:/custom/timer_tour.png',
    },
    flashIcon: {
        uri: isIos ? 'flash_icon.png' : 'asset:/custom/flash_icon.png',
    },
    notesPreview: {
        uri: isIos ? 'notes_preview.png' : 'asset:/custom/notes_preview.png',
    },
    balancePreview: {
        uri: isIos ? 'balance_preview.png' : 'asset:/custom/balance_preview.png',
    },
    noteFeatureImage: {
        uri: isIos ? 'note_feature_title.png' : 'asset:/custom/note_feature_title.png',
    },
    noteFeatureImageTablet: {
        uri: isIos
            ? 'note_feature_title_tablet.png'
            : 'asset:/custom/note_feature_title_tablet.png',
    },
    lastChanceImage: {
        uri: isIos ? 'last_chance_image.png' : 'asset:/custom/last_chance_image.png',
    },
    lastChanceImageTablet: {
        uri: isIos ? 'last_chance_image_tablet.png' : 'asset:/custom/last_chance_image_tablet.png',
    },
    promoVideoThumbnail: {
        uri: isIos ? 'promo_video_thumbnail.jpg' : 'asset:/custom/promo_video_thumbnail.jpg',
    },
    check_box_checked: {
        uri: isIos ? 'check_box_checked.png' : 'asset:/custom/check_box_checked.png',
    },
    check_box_unchecked: {
        uri: isIos ? 'check_box_unchecked.png' : 'asset:/custom/check_box_unchecked.png',
    },
    visibilityOn: {
        uri: isIos ? 'visibility_on.png' : 'asset:/custom/visibility_on.png',
    },
    visibilityOff: {
        uri: isIos ? 'visibility_off.png' : 'asset:/custom/visibility_off.png',
    },
    reviewAuthor1: {
        uri: isIos ? 'review_author_1.png' : 'asset:/custom/review_author_1.png',
    },
    reviewAuthor2: {
        uri: isIos ? 'review_author_2.png' : 'asset:/custom/review_author_2.png',
    },
    reviewAuthor3: {
        uri: isIos ? 'review_author_3.png' : 'asset:/custom/review_author_3.png',
    },
    reviewAuthor4: {
        uri: isIos ? 'review_author_4.png' : 'asset:/custom/review_author_4.png',
    },
    reviewAuthor5: {
        uri: isIos ? 'review_author_5.png' : 'asset:/custom/review_author_5.png',
    },
    reviewAuthor6: {
        uri: isIos ? 'review_author_6.png' : 'asset:/custom/review_author_6.png',
    },
    reviewAndroidTour: {
        uri: isIos
            ? 'review_android_brand_tour.png'
            : 'asset:/custom/review_android_brand_tour.png',
    },
    reviewIosTour: {
        uri: isIos ? 'review_ios_brand_tour.png' : 'asset:/custom/review_android_brand_tour.png',
    },
    tourUpdatedPaymentScreenImage: {
        uri: isIos
            ? 'tour_update_payment_screen.png'
            : 'asset:/custom/tour_update_payment_screen.png',
    },
    tourUpdatedCheckedIcon: {
        uri: isIos ? 'tour_update_check_icon.png' : 'asset:/custom/tour_update_check_icon.png',
    },
    compositionIcon: {
        uri: isIos ? 'composition.png' : 'asset:/custom/composition.png',
    },
    bookOutlinedIcon: {
        uri: isIos ? 'book_outlined.png' : 'asset:/custom/book_outlined.png',
    },
    crossPlatformIcon: {
        uri: isIos ? 'cross-platform.png' : 'asset:/custom/cross-platform.png',
    },
    timerIconBg: {
        uri: isIos ? 'timer.png' : 'asset:/custom/timer.png',
    },
    tourUpdateRateApp: {
        uri: isIos ? 'say_thanks.png' : 'asset:/custom/say_thanks.png',
    },
    pushNotificationIllustration: {
        uri: isIos
            ? 'push_notification_illustration.jpg'
            : 'asset:/custom/push_notification_illustration.jpg',
    },
    pushNotificationIllustrationTablet: {
        uri: isIos
            ? 'push_notification_illustration_tablet.jpg'
            : 'asset:/custom/push_notification_illustration_tablet.jpg',
    },
    autoGradeAcquisition1: {
        uri: isIos ? 'auto_grade_acquisition_1.png' : 'asset:/custom/auto_grade_acquisition_1.png',
    },
    autoGradeAcquisition2: {
        uri: isIos ? 'auto_grade_acquisition_2.png' : 'asset:/custom/auto_grade_acquisition_2.png',
    },
    autoGradeAcquisition3: {
        uri: isIos ? 'auto_grade_acquisition_3.png' : 'asset:/custom/auto_grade_acquisition_3.png',
    },
    autoGradeAcquisition4: {
        uri: isIos ? 'auto_grade_acquisition_4.png' : 'asset:/custom/auto_grade_acquisition_4.png',
    },
    autoGradeAcquisition5: {
        uri: isIos ? 'auto_grade_acquisition_5.png' : 'asset:/custom/auto_grade_acquisition_5.png',
    },
    autogradeOnboarding1: {
        uri: isIos ? 'autograde_onboarding_1.png' : 'asset:/custom/autograde_onboarding_1.png',
    },
    autogradeOnboarding2: {
        uri: isIos ? 'autograde_onboarding_2.png' : 'asset:/custom/autograde_onboarding_2.png',
    },
    autogradeOnboarding3: {
        uri: isIos ? 'autograde_onboarding_3.png' : 'asset:/custom/autograde_onboarding_3.png',
    },
    autogradeOnboarding4: {
        uri: isIos ? 'autograde_onboarding_4.png' : 'asset:/custom/autograde_onboarding_4.png',
    },
    halLeonard: {
        uri: isIos ? 'hal_leonard.png' : 'asset:/custom/hal_leonard.png',
    },
    tourUpdateBFirstStep: {
        uri: isIos ? 'tour_update_1_b.png' : 'asset:/custom/tour_update_1_b.png',
    },
    tourFirstStep: {
        uri: isIos ? 'tour_first_step_new.png' : 'asset:/custom/tour_first_step_new.png',
    },
    verifiedReviewImage: {
        uri: isIos ? 'verified_review_image.png' : 'asset:/custom/verified_review_image.png',
    },
    flashSaleNewBg: {
        uri: isIos ? 'flash_sale_new_bg.png' : 'asset:/custom/flash_sale_new_bg.png',
    },
    tourUpdateSocialProof: {
        uri: isIos ? 'tour_update_social_proof.png' : 'asset:/custom/tour_update_social_proof.png',
    },
    successFilled: {
        uri: isIos ? 'success_filled.png' : 'asset:/custom/success_filled.png',
    },
    scoreScanSuccess: {
        uri: isIos ? 'score_scan_success.png' : 'asset:/custom/score_scan_success.png',
    },
    scoreScanFail: {
        uri: isIos ? 'score_scan_fail.png' : 'asset:/custom/score_scan_fail.png',
    },
    coursesCarousel_1: {
        uri: isIos ? 'courses_carousel_1.png' : 'asset:/custom/courses_carousel_1.png',
    },
    coursesCarousel_2: {
        uri: isIos ? 'courses_carousel_2.png' : 'asset:/custom/courses_carousel_2.png',
    },
    coursesCarousel_3: {
        uri: isIos ? 'courses_carousel_3.png' : 'asset:/custom/courses_carousel_3.png',
    },
    coursesCarousel_4: {
        uri: isIos ? 'courses_carousel_4.png' : 'asset:/custom/courses_carousel_4.png',
    },
    coursesCarousel_5: {
        uri: isIos ? 'courses_carousel_5.png' : 'asset:/custom/courses_carousel_5.png',
    },
    coursesCarousel_6: {
        uri: isIos ? 'courses_carousel_6.png' : 'asset:/custom/courses_carousel_6.png',
    },
    coursesCarousel_7: {
        uri: isIos ? 'courses_carousel_7.png' : 'asset:/custom/courses_carousel_7.png',
    },
    coursesCarousel_8: {
        uri: isIos ? 'courses_carousel_8.png' : 'asset:/custom/courses_carousel_8.png',
    },
    coursesCarousel_9: {
        uri: isIos ? 'courses_carousel_9.png' : 'asset:/custom/courses_carousel_9.png',
    },
    coursesCarousel_10: {
        uri: isIos ? 'courses_carousel_10.png' : 'asset:/custom/courses_carousel_10.png',
    },
    coursesCarousel_11: {
        uri: isIos ? 'courses_carousel_11.png' : 'asset:/custom/courses_carousel_11.png',
    },
    coursesCarousel_12: {
        uri: isIos ? 'courses_carousel_12.png' : 'asset:/custom/courses_carousel_12.png',
    },
    coursesCarousel_13: {
        uri: isIos ? 'courses_carousel_13.png' : 'asset:/custom/courses_carousel_13.png',
    },
    coursesCarousel_14: {
        uri: isIos ? 'courses_carousel_14.png' : 'asset:/custom/courses_carousel_14.png',
    },
    coursesCarousel_15: {
        uri: isIos ? 'courses_carousel_15.png' : 'asset:/custom/courses_carousel_15.png',
    },
    wavesBrand: {
        uri: isIos ? 'waves_brand.png' : 'asset:/custom/waves_brand.png',
    },
    brandLoader: {
        uri: isIos ? 'ic_brand_loader.png' : 'asset:/custom/ic_brand_loader.png',
    },
}
