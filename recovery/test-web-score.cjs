const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(relative, dependencies = {}, globals = {}) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    const result = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}, reportDiagnostics: true});
    assert.equal((result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, relative);
    const module = {exports: {}};
    vm.runInNewContext(result.outputText, {module, exports: module.exports, require: name => {
        if (name in dependencies) return dependencies[name];
        throw new Error('Unexpected dependency ' + name);
    }, URL, AbortController, setTimeout, clearTimeout, console, ...globals}, {filename: relative});
    return module.exports;
}
const protocol = load('src/App/Services/webScoreProtocol.ts', {'react-native-url-polyfill': require('whatwg-url-without-unicode')});
const flight = load('src/App/Services/singleFlight.ts');
const page = 'https://musescore.com/user/7/scores/42';
const file = 'https://cdn.ustatik.com/test/score.mscz?signature=one&expires=two';
const state = {page: {data: {score: {id: 42, urls: {mscz: file}}, recommended: [{urls: {mscz: 'https://cdn.ustatik.com/wrong.mscz'}}]}}};
const html = '<div data-content="' + JSON.stringify(state).replaceAll('&', '&amp;').replaceAll('"', '&quot;') + '"></div>';
assert.equal(protocol.advertisedScoreFiles(html, page)[0].url, file);
assert.equal(protocol.advertisedScoreFiles(html, page).length, 1, 'exclude recommended scores');
assert.equal(protocol.trustedWebUrl('https://musescore.com.attacker.test/file.mscz', page), null);
assert.equal(protocol.trustedWebUrl('http://musescore.com/file.mscz', page), null);
assert.equal(protocol.trustedWebUrl('https://user:pass@musescore.com/file.mscz', page), null);
assert.equal(protocol.advertisedScoreFiles('<a href="/score/42/download/mxl?x=1&amp;y=2">Export</a>', page)[0].url, 'https://musescore.com/score/42/download/mxl?x=1&y=2');
assert.equal(protocol.advertisedScoreFiles('<img src="https://cdn.ustatik.com/score_0.svg">', page).length, 0, 'preview is not a score');
assert.equal(protocol.webPageState('<script>window.UGAPP.store = {"text":"} escaped \\" {"};</script>').length, 1);
assert.equal(protocol.webPageState('<script>window.UGAPP.store = {run: alert(1)};</script>').length, 0, 'never execute page JS');
assert.match(protocol.webHttpError(403, '<title>Just a moment...</title>').message, /Cloudflare/);
let store, fetchCalls, downloadCalls, responseStatus, body, downloadedBody;
const rnfs = {
    CachesDirectoryPath: '/cache',
    exists: async name => store.has(name),
    mkdir: async () => {},
    unlink: async name => {store.delete(name)},
    read: async (name, length) => (store.get(name) || '').slice(0, length),
    readFile: async name => store.get(name),
    moveFile: async (from, to) => {store.set(to, store.get(from)); store.delete(from)},
    stopDownload: () => {},
    downloadFile: options => {
        downloadCalls++;
        store.set(options.toFile, downloadedBody);
        return {jobId: 1, promise: Promise.resolve({statusCode: 200, bytesWritten: downloadedBody.length})};
    },
};
const provider = load('src/App/Services/WebScoreProvider.ts', {
    '@dr.pogodin/react-native-fs': rnfs,
    'react-native': {NativeModules: {}},
    'react-native-url-polyfill': require('whatwg-url-without-unicode'),
    './FilesProvider': {isCompleteZip: async name => store.get(name) === 'VALID_COMPLETE_ZIP'},
    './singleFlight': flight,
    './webScoreProtocol': protocol,
}, {fetch: async () => {fetchCalls++; return {ok: responseStatus === 200, status: responseStatus, text: async () => body}}});
function reset() {store = new Map(); fetchCalls = downloadCalls = 0; responseStatus = 200; body = html; downloadedBody = 'VALID_COMPLETE_ZIP'}
(async () => {
    reset();
    const score = {id: 42, authorId: 7, revision: 3};
    const results = await Promise.all([provider.downloadWebScore(score), provider.downloadWebScore(score)]);
    assert.equal(results[0], '/cache/WebScores/42-3.mscz');
    assert.equal(results[0], results[1]);
    assert.equal(fetchCalls, 1); assert.equal(downloadCalls, 1, 'single download for concurrent preview/play');
    assert.equal(store.has(results[0] + '.download'), false);
    assert.equal(await provider.findWebScoreFile(42, 3), results[0]);
    assert.equal(await provider.findWebScoreFile(42, 2), null, 'never reuse another revision');
    provider.clearWebScoreSelection(42);
    assert.equal(await provider.findWebScoreFile(42, 3), null);
    await provider.downloadWebScore(score);
    assert.equal(fetchCalls, 1, 'validated cache reused');
    reset(); downloadedBody = '<html>login</html>';
    await assert.rejects(provider.downloadWebScore(score), error => error.webScoreFailure && /повреждённый файл/.test(error.message));
    assert.equal(store.has('/cache/WebScores/42-3.mscz'), false);
    assert.equal(store.has('/cache/WebScores/42-3.mscz.download'), false);
    reset(); responseStatus = 403; body = '<title>Just a moment...</title>';
    await assert.rejects(provider.downloadWebScore(score), error => error.webScoreFailure && /Cloudflare/.test(error.message));
    assert.equal(downloadCalls, 0);
    reset(); body = '<html><img src="score_0.svg"></html>';
    await assert.rejects(provider.downloadWebScore(score), /не предоставил исходный/);
    console.log('PASS: web score links, source isolation, no JS execution, HTTP errors, file validation, concurrent downloads, cache and cleanup');
})().catch(error => {console.error(error); process.exitCode = 1});
