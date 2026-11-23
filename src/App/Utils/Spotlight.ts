/**
 * https://github.com/ombori/react-native-search-api
 */
import { NativeModules, NativeEventEmitter, Image } from 'react-native'

const { Spotlight } = NativeModules
const SPOTLIGHT_SEARCH_ITEM_TAPPED_EVENT = 'spotlightSearchItemTapped'
const APP_HISTORY_SEARCH_ITEM_TAPPED = 'appHistorySearchItemTapped'

function resolveItemThumbnail(item: Record<string, any>): Record<string, any> {
    const itemCopy = JSON.parse(JSON.stringify(item))
    itemCopy.thumbnail = Image.resolveAssetSource(item.thumbnail)
    return itemCopy
}
/**
 * `SearchApi` gives you a general interface to interact with the iOS Search API.
 *
 * ## Search item keys
 *
 * Dictionaries, passed to create spotlight and app history items have some common
 * and some specific keys, here is the list of all possible keys.
 *
 * ### Common keys
 *
 * #### title: string
 * Title of the item. Required for both item types.
 *
 * #### contentDescription: string
 * Description of the item. Optional.
 *
 * #### keywords: Array<string>
 * An array of keywords, assigned to the search item. Optional.
 *
 * #### thumbnail: string|object
 * Image to be used as the thumbnail. Same as the `source` value of the `Image`
 * view. Optional.
 *
 * ### Spotlight-specific keys
 *
 * #### uniqueIdentifier: string
 * The unique identifier of the spotlight item, passed later on during
 * the item opening event. Required.
 *
 * #### domain: string
 * The domain for the spotlight item. Optional.
 *
 * ### App history-specific keys
 *
 * #### userInfo: Object
 * A dictionary, passed later on during the item opening event. Required.
 *
 * #### eligibleForPublicIndexing: boolean
 * A flag, that when set to `true` allows to add the item to the public index.
 * Optional.
 *
 * #### expirationDate: Date
 * Expiration date of the search item. Optional.
 *
 * #### webpageURL: string
 * URL of the page, representing the same content on the app's website.
 */

class SearchApi extends NativeEventEmitter {
    /* eslint-disable class-methods-use-this */
    constructor() {
        super(Spotlight)
    }

    /**
     * Gets the initial spotlight item's identifier. Resoves to null
     * in case the app was started otherwise.
     *
     * @NOTE A good place for calling this method is the component's
     * `componentDidMount` override.
     */
    async getInitialSpotlightItem() {
        return await Spotlight.getInitialSpotlightItem() as string | undefined
    }

    /**
     * Gets the initial app history item's user info dictionary. Resolves to null
     * in case the app was started otherwise.
     *
     * @NOTE A good place for calling this method is the component's
     * `componentDidMount` override.
     */
    getInitialAppHistoryItem(): Promise<any> {
        // @TODO types
        return Spotlight.getInitialAppHistoryItem()
    }

    /**
     * Registers for the spotlight item opening event.
     *
     * @NOTE A good place for calling this method is the component's
     * `componentDidMount` override.
     *
     * @param listener A function that takes a single parameter
     * of type `string`, containing the unique identifier of the
     * spotlight item.
     */
    addOnSpotlightItemOpenEventListener(listener: (...args: Array<any>) => any) {
        return this.addListener(SPOTLIGHT_SEARCH_ITEM_TAPPED_EVENT, listener)
    }

    /**
     * Registers for the app history item opening event.
     *
     * @NOTE A good place for calling this method is the component's
     * `componentDidMount` override.
     *
     * @param listener A function that takes a single parameter
     * of type `Object`, containing the user info, passed when
     * creating the search item.
     */
    addOnAppHistoryItemOpenEventListener(listener: (...args: Array<any>) => any) {
        this.addListener(APP_HISTORY_SEARCH_ITEM_TAPPED, listener)
    }

    /**
     * Removes the app history item opening event listener.
     *
     * @NOTE A good place for calling this method is the component's
     * `componentWillUnmount` override.
     *
     * @param listener The function, previously passed to
     * `addOnAppHistoryItemOpenEventListener`.
     */

    /**
     * Adds a new item to the spotlight index.
     *
     * @param item A dictionary with the item's parameters.
     * See the comment above this class for more info.
     */
    indexSpotlightItem(item: Record<string, any>): Promise<any> {
        return this.indexSpotlightItems([item])
    }

    /**
     * Adds an array of new items to the spotlight index.
     *
     * @param items An array with new items to be added.
     * See the comment above this class for more info.
     */
    indexSpotlightItems(items: any[]): Promise<any> {
        const copies = items.map(item => resolveItemThumbnail(item))
        return Spotlight.indexItems(copies)
    }

    /**
     * Deletes all items with specified identifiers from the
     * spotlight index.
     *
     * @param identifiers An array of unique item identifiers.
     */
    deleteSpotlightItemsWithIdentifiers(identifiers: any[]): Promise<any> {
        return Spotlight.deleteItemsWithIdentifiers(identifiers)
    }

    /**
     * Deletes all items in specified domains from the spotlight index.
     *
     * @param domains An array of spotlight item domains.
     */
    deleteSpotlightItemsInDomains(domains: any[]): Promise<any> {
        return Spotlight.deleteItemsInDomains(domains)
    }

    /**
     * Clears up the spotlight index.
     */
    deleteAllSpotlightItems(): Promise<any> {
        return Spotlight.deleteAllItems()
    }

    /**
     * Creates a new search item, added to the app history.
     *
     * @param item A dictionary with the item's parameters.
     * See the comment above this class for more info.
     */
    indexAppHistoryItem(item: Record<string, any>): Promise<any> {
        const itemCopy = resolveItemThumbnail(item)
        return Spotlight.createUserActivity(itemCopy)
    }
}

export default new SearchApi()
