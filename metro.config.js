const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const base = getDefaultConfig(__dirname)

module.exports = mergeConfig(base, {
    transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer/react-native'),
    },
    resolver: {
        assetExts: [...base.resolver.assetExts.filter(ext => ext !== 'svg'), 'lottie'],
        sourceExts: [...base.resolver.sourceExts, 'svg'],
        blockList: [
            /recovery\/.*/,
            // VisionCamera can use Skia for frame processors, which this app disables.
            /[/\\]node_modules[/\\]@shopify[/\\]react-native-skia(?:[/\\]|$)/,
        ],
    },
})
