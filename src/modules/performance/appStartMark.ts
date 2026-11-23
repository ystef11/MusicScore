import { APP_START_MARKS } from './constants/appStartMarks'

// Must stay the first import of the app entry file: the JS Init phase is measured from here.
performance.mark(APP_START_MARKS.jsBundleExecStart)
