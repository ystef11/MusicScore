import { Linking } from 'react-native'
import type { EmitterSubscription } from 'react-native'
import { CREATORS, SUPPORTED_LINKS } from '../constants/schemes'

type Subscriber = { predicate: (link: string) => boolean; onLink: (link: string) => void }

// Local link routing only: no attribution SDK, identifiers or tracking requests.
const createLinkService = () => {
    let linkingSub: EmitterSubscription | null = null
    let subscribers: Subscriber[] = []
    let pendingLink: string | null = null

    const notify = (link: string) => {
        subscribers.forEach(({ predicate, onLink }) => {
            if (predicate(link)) onLink(link)
        })
    }

    const handleDeeplink = (link: string): boolean => {
        if (!SUPPORTED_LINKS.some(prefix => link.startsWith(prefix))) return false
        let target = link
        try {
            const parsed = new URL(link)
            const key = parsed.searchParams.get('deep_link_value') as keyof typeof CREATORS | null
            if (key && CREATORS[key]) {
                target = CREATORS[key](parsed.searchParams.get('deep_link_sub1') || '')
            }
        } catch {
            return false
        }
        if (subscribers.length) notify(target)
        else pendingLink = target
        return true
    }

    const subscribe = (predicate: Subscriber['predicate'], onLink: Subscriber['onLink']) => {
        const subscriber = { predicate, onLink }
        subscribers.push(subscriber)
        if (pendingLink && predicate(pendingLink)) {
            const link = pendingLink
            pendingLink = null
            onLink(link)
        }
        return () => { subscribers = subscribers.filter(item => item !== subscriber) }
    }

    const startListeningDeepLinks = async () => {
        if (linkingSub) return
        linkingSub = Linking.addEventListener('url', ({ url }) => { handleDeeplink(url) })
        const initialUrl = await Linking.getInitialURL()
        if (initialUrl) handleDeeplink(initialUrl)
    }

    return {
        getId: () => null,
        logEvent: (_eventName: string, _eventValues: object) => {},
        dispose: () => {
            linkingSub?.remove()
            linkingSub = null
            subscribers = []
            pendingLink = null
        },
        subscribe,
        startListeningDeepLinks,
        handleDeeplink,
        notify,
        processPendingAttribution: () => {},
    }
}

export const AppsFlyerService = createLinkService()
export const isMonetizationLink = (link: string) => link.startsWith('musescore://monetization/')
