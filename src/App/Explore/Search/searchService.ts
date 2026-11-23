import { apiEndpoints } from '@mu-native/api'

export async function fetchSuggestions(searchText: string) {
    try {
        const query = searchText.toLowerCase()
        let baseUrl = apiEndpoints.searchSuggestions
        baseUrl += `${query[0]}/`
        baseUrl += `${query.slice(0, 5)}.js`
        const response = await fetch(baseUrl)
        const responseJSON = await response.json()

        if (responseJSON && Array.isArray(responseJSON.suggestions)) {
            return responseJSON.suggestions.filter((item: any) => item.indexOf(query) === 0)
        }
    } catch (error) {
        // TODO: error handler
    }

    return null
}
