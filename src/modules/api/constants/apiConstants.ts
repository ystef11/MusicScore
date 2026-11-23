// `process.env.API_PROD_URL` is inlined at build time by babel.config.js.
// Set it via the CI "build mu" job input to build the app against a custom backend.
const apiProdUrl = process.env.API_PROD_URL || 'https://api.musescore.com/v2'
const apiStandUrl = `http://api.musescore.com.ovakilov.vps.dev.mu.se/v2`
const apiVPSUrl = `http://api.musescore.com.vakilov.lan/v2`
// const apiProdUrl = 'http://api.musescore.com.derepko.lan/v2'
// const apiProdUrl = 'http://api.musescore.com.timofeev.lan/v2'
// const apiProdUrl = 'http://api.musescore.com.staging1.lan/v2'
// https://api.musescore.com.golishnikov.vps.dev.mu.se
// const apiProdUrl = 'https://api.musescore.com.sgolishnikov.vps.dev.mu.se/v2'
// sgolishnikov.vps.dev.mu.se
export const apiConstants = {
    apiProdUrl,
    apiVPSUrl,
}
