// Gradle adds --reset-cache to every bundle. Metro already invalidates changed sources.
// Retain incremental transforms; package code/assets normally for standalone APKs.
if (process.argv[2] === 'bundle' && process.env.RESET_METRO_CACHE !== '1') {
    process.argv = process.argv.filter(argument => argument !== '--reset-cache');
}
require('@react-native-community/cli').run();
