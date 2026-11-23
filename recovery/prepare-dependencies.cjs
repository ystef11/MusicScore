const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const mmkvGradle = 'node_modules/react-native-mmkv/android/build.gradle';
const mmkvPlatformContext = 'node_modules/react-native-mmkv/android/src/main/java/com/margelo/nitro/mmkv/HybridMMKVPlatformContext.kt';
const nitroRoot = 'node_modules/react-native-nitro-modules';
const nitroGradle = nitroRoot + '/android/build.gradle';
const prefabModules = ['react-native-nitro-modules', 'react-native-mmkv', 'react-native-iap'];
const legacyPrefabVariants = /^    def variants = proj\.android\.hasProperty\('applicationVariants'\)[^\n]*\n[\s\S]*?^    }\n/m;
const refreshPrefabInputs = [
 '    // Refresh existing Prefab inputs for the selected ABIs.',
 '    proj.fileTree(dir: new File(proj.projectDir, ".cxx"),',
 '        includes: abis.collect { abi -> "*/*/" + abi + "/prefab_config.json" }).each { prefabConfig ->',
 '      prefabConfig.setLastModified(System.currentTimeMillis())',
 '    }',
 '',
].join('\n');

const kotlinModules = [
 'node_modules/@dr.pogodin/react-native-fs/android/build.gradle',
 'node_modules/@react-native-documents/picker/android/build.gradle',
 'node_modules/@react-native-google-signin/google-signin/android/build.gradle',
 'node_modules/@swan-io/react-native-browser/android/build.gradle',
 'node_modules/lottie-react-native/android/build.gradle',
 'node_modules/react-native-localize/android/build.gradle',
 mmkvGradle,
 nitroGradle,
 'node_modules/react-native-permissions/android/build.gradle',
 'node_modules/react-native-track-player/android/build.gradle',
 'node_modules/react-native-video/android/build.gradle',
 'node_modules/react-native-vision-camera/android/build.gradle',
 'node_modules/react-native-volume-manager/android/build.gradle',
 'node_modules/react-native-webview/android/build.gradle',
];
const lottieGradle = 'node_modules/lottie-react-native/android/build.gradle';
const kotlinArchitectureModules = [
 'node_modules/@swan-io/react-native-browser/android/build.gradle',
 'node_modules/react-native-localize/android/build.gradle',
 'node_modules/react-native-permissions/android/build.gradle',
];

const legacyKotlinPlugin = /^apply plugin: ["'](?:org\.jetbrains\.kotlin\.android|kotlin-android)["']$/m;
const builtInKotlin = '// Use the Kotlin compiler provided by Android Gradle Plugin.';
const launchArgumentsGradle = 'node_modules/react-native-launch-arguments/android/build.gradle';
const oldLaunchArgumentsVariants = /^    android\.libraryVariants\.all \{ variant ->\n[\s\S]*?^    }\n\n/m;
const newLaunchArgumentsVariants = [
 'androidComponents.onVariants(androidComponents.selector().all()) { variant ->',
 '    def variantName = variant.name.capitalize()',
 '    tasks.register("jar${variantName}", Jar) {',
 '        def compileJava = tasks.named("compile${variantName}JavaWithJavac", JavaCompile)',
 '        from(compileJava.flatMap { it.destinationDirectory })',
 '    }',
 '}',
 '',
 'afterEvaluate { project ->',
].join('\n');

const fixes = [
 // AGP 9.5 publishes Java 17 variants, so its consumer must target Java 17 too.
 ['node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts', 'JavaVersion.VERSION_11', 'JavaVersion.VERSION_17'],
 ['node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts', 'JvmTarget.JVM_11', 'JvmTarget.JVM_17'],
 // Keep the React Native build plugins compatible with Gradle 9.7's embedded Kotlin.
 ['node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml', 'agp = "9.2.1"', 'agp = "9.5.0"'],
 ['node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml', 'kotlin = "2.2.0"', 'kotlin = "2.4.21"'],
 ['node_modules/react-native-keyevent/android/build.gradle', 'compileSdkVersion 31', 'compileSdkVersion rootProject.ext.compileSdkVersion'],
 ['node_modules/react-native-play-install-referrer/android/build.gradle', "proguard-android.txt", "proguard-android-optimize.txt"],
 ['node_modules/@react-native-documents/picker/android/src/main/java/com/reactnativedocumentpicker/RNDocumentPickerModule.kt', 'val currentActivity = currentActivity', 'val currentActivity = getCurrentActivity()'],
 [mmkvGradle, 'com.android.tools.build:gradle:9.2.1', 'com.android.tools.build:gradle:9.5.2'],
 [mmkvGradle, 'rootProject.getProperties().get("reactNativeArchitectures")', 'rootProject.findProperty("reactNativeArchitectures")'],
 [mmkvGradle, 'project.properties["NitroMmkv_" + name]', 'project.findProperty("NitroMmkv_" + name)'],
 [mmkvGradle, 'compileSdkVersion = getExtOrIntegerDefault', 'compileSdk = getExtOrIntegerDefault'],
 [mmkvGradle, '    minSdkVersion = getExtOrIntegerDefault("minSdkVersion")\n    targetSdkVersion = getExtOrIntegerDefault("targetSdkVersion")', '    minSdk = getExtOrIntegerDefault("minSdkVersion")'],
 [mmkvGradle, '  lintOptions {\n    disable "GradleCompatible"\n  }', '  testOptions {\n    targetSdk = getExtOrIntegerDefault("targetSdkVersion")\n  }\n\n  lint {\n    disable.add("GradleCompatible")\n  }'],
 [mmkvGradle, 'abiFilters (*reactNativeArchitectures())', 'abiFilters.addAll(reactNativeArchitectures().toList())'],
 [mmkvGradle, 'io.github.zhongwuzw:mmkv:2.4.1', 'io.github.zhongwuzw:mmkv:2.4.2'],
 [mmkvPlatformContext, 'return context.filesDir.absolutePath + "/mmkv";', 'return context.filesDir.absolutePath + "/mmkv"'],
 [mmkvPlatformContext,
    '@Keep\nclass HybridMMKVPlatformContext: HybridMMKVPlatformContextSpec() {',
    '@Keep\n@Suppress("unused") // Instantiated from C++ via JNI.\nclass HybridMMKVPlatformContext: HybridMMKVPlatformContextSpec() {'],
 [mmkvGradle, /^\n  sourceSets \{\n    main \{\n      if \(isNewArchitectureEnabled\(\)\) \{\n        java\.srcDirs \+= \[\n          \/\/ React Codegen files\n          [^\n]*\/generated\/source\/codegen\/java"\n        ]\n      }\n    }\n  }\n/m, '\n  // The React Native Gradle plugin registers the Codegen Java sources.\n'],
 [nitroGradle, '${project.buildDir}/headers/nitromodules', '${project.projectDir}/prefab-headers'],
 ...kotlinModules.map(module => [module, legacyKotlinPlugin, builtInKotlin]),
 // Built-in Kotlin does not compile Kotlin files registered as additional Java sources.
 ['node_modules/react-native-mmkv/nitrogen/generated/android/NitroMmkv+autolinking.gradle',
    /^      java\.srcDirs \+= \[\n        \/\/ Nitrogen files\n        "\$\{project\.projectDir\}\/\.\.\/nitrogen\/generated\/android\/kotlin"\n      \]/m,
    '      kotlin.directories.add("../nitrogen/generated/android/kotlin")'],
 [lottieGradle, "java.srcDirs += ['src/newarch', \"${project.buildDir}/generated/source/codegen/java\"]", "kotlin.directories.add('src/newarch')"],
 [lottieGradle, "java.srcDirs += ['src/oldarch']", "kotlin.directories.add('src/oldarch')"],
 [nitroGradle, /java\.srcDirs \+= \[\n\s*\/\/ React Codegen files\n\s*"\$\{project\.buildDir\}\/generated\/source\/codegen\/java",\n\s*"src\/newarch"\n\s*\]/, 'kotlin.directories.add("src/newarch")'],
 [nitroGradle, 'java.srcDirs += ["src/oldarch"]', 'kotlin.directories.add("src/oldarch")'],
 ...kotlinArchitectureModules.flatMap(module => [
    [module, 'java.srcDirs += ["src/newarch"]', 'kotlin.directories.add("src/newarch")'],
    [module, 'java.srcDirs += ["src/oldarch"]', 'kotlin.directories.add("src/oldarch")'],
 ]),
 [launchArgumentsGradle, oldLaunchArgumentsVariants, '    // Variant JAR tasks are registered with Android Components above.\n\n'],
 [launchArgumentsGradle, /^afterEvaluate \{ project ->\n    \/\/ some Gradle build hooks ref:/m, newLaunchArgumentsVariants + '\n    // Publishing hooks:'],
 ['node_modules/@react-native-community/datetimepicker/android/build.gradle', '    kotlinOptions {\n        jvmTarget = \'17\'\n    }', '    compileOptions {\n        sourceCompatibility JavaVersion.VERSION_17\n        targetCompatibility JavaVersion.VERSION_17\n    }'],
 ...prefabModules.map(module => ['node_modules/' + module + '/android/fix-prefab.gradle', legacyPrefabVariants, refreshPrefabInputs]),
];

const updatedFiles = new Map();
for (const [file, before, after] of fixes) {
    const full = path.join(root, file);
    const source = updatedFiles.get(full) ?? fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
    const matches = typeof before === 'string' ? source.includes(before) : before.test(source);
    if (!matches && !source.includes(after)) throw new Error('Dependency changed: ' + file);
    if (matches) {
        updatedFiles.set(full, typeof before === 'string' ? source.replaceAll(before, after) : source.replace(before, after));
    }
}

for (const [file, source] of updatedFiles) {
    fs.writeFileSync(file, source);
}

// Studio configures native models before Gradle runs NitroModules' prepareHeaders task.
const nitroDirectory = path.join(root, nitroRoot);
const prefabHeaders = path.join(nitroDirectory, 'android/prefab-headers/NitroModules');
for (const source of ['android/src/main/cpp', 'cpp']) {
    fs.cpSync(path.join(nitroDirectory, source), prefabHeaders, {
        recursive: true,
        preserveTimestamps: true,
        filter: entry => fs.statSync(entry).isDirectory() || entry.endsWith('.hpp'),
    });
}
