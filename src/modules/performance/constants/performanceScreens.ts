/**
 * Screen labels used in `FSR <screen>` events. They are dashboard names, deliberately
 * decoupled from navigation route names. A label must not contain `-`: it is embedded into
 * `tracker-<screen>-tti` performance marks.
 */
export const PerformanceScreen = {
    browse: 'Browse',
    home: 'Home',
    courses: 'Courses',
    library: 'Library',
    search: 'Search',
    profile: 'Profile',
    scoreInfo: 'ScoreInfo',
    score: 'Score',
} as const

export type TPerformanceScreen = (typeof PerformanceScreen)[keyof typeof PerformanceScreen]
