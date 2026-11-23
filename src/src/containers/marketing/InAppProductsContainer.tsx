import { memo, useCallback, useEffect, useState } from 'react'

import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import {
    billingThunks,
    getE2eTestSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    productsMap,
    subscriptionMap,
    useIAP,
} from '@mu-native/marketing'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'
import debounce from 'lodash.debounce'

const e2eTestSubscriptions = getE2eTestSubscriptions()

const InAppLogicContainer = memo(() => {
    const { subscriptions, products, fetchProducts, connected } = useIAP()

    const actions = useActions({
        setProducts: marketingStoreChunk.actions.setProducts,
        setSubscriptions: marketingStoreChunk.actions.setSubscriptions,
        checkStoreRegion: billingThunks.checkStoreRegion,
    })
    const [
        network,
        isStudentAge,
        { planOfferName, planOfferNameNew, planNameSpecialOffer },
        introductoryOfferData,
        appState,
    ] = useValues([
        systemStoreChunk.props.getNetwork,
        marketingStoreChunk.props.getIsStudentAge,
        dynamicDecorStoreChunk.props.getActiveDecorData,
        marketingStoreChunk.props.getIntroductoryOfferData,
        systemStoreChunk.props.getAppState,
    ])
    const [isFirstFetch, setIsFirstFetch] = useState(false)

    const fetchSubscriptions = useCallback(
        debounce(() => {
            fetchProducts({
                skus: marketingConstants.listOfSubscriptions,
                type: 'subs',
            }).then(() => {
                setIsFirstFetch(true)
            })
        }, 300),
        [],
    )

    useEffect(() => {
        if (connected && subscriptions?.length === 0) {
            fetchSubscriptions()
        }
    }, [network?.isConnected, appState, connected])

    useEffect(() => {
        if (products?.length && connected) {
            actions.setProducts(products.map(productsMap))
        }
    }, [products?.length, connected])

    useEffect(() => {
        if (subscriptions?.length) {
            fetchProducts({ skus: marketingConstants.listInApps, type: 'in-app' })

            actions.checkStoreRegion()
        }
    }, [subscriptions])

    useEffect(() => {
        if (subscriptions?.length && connected) {
            actions.setSubscriptions(
                subscriptions.map(subscription =>
                    subscriptionMap({
                        subscription,
                        isAgeExp: isStudentAge,
                        planOfferName,
                        planOfferNameNew,
                        planNameSpecialOffer,
                        introductoryOfferData,
                    }),
                ),
            )
        }
    }, [
        subscriptions?.length,
        connected,
        isStudentAge,
        planOfferName,
        planOfferNameNew,
        planNameSpecialOffer,
        introductoryOfferData,
    ])

    useEffect(() => {
        if (!e2eTestSubscriptions || subscriptions?.length) return
        actions.setSubscriptions(
            e2eTestSubscriptions.map(subscription =>
                subscriptionMap({
                    subscription,
                    isAgeExp: isStudentAge,
                    planOfferName,
                    planOfferNameNew,
                    planNameSpecialOffer,
                    introductoryOfferData,
                }),
            ),
        )
    }, [
        subscriptions?.length,
        isStudentAge,
        planOfferName,
        planOfferNameNew,
        planNameSpecialOffer,
        introductoryOfferData,
    ])

    useEffect(() => {
        let intervalId: ReturnType<typeof setTimeout> | undefined

        if (isFirstFetch && connected && network?.isConnected && subscriptions?.length === 0) {
            intervalId = setInterval(fetchSubscriptions, 1000)
        }

        if (isFirstFetch && intervalId && subscriptions.length > 0) {
            clearInterval(intervalId)
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [isFirstFetch, subscriptions.length, connected, network?.isConnected, fetchSubscriptions])

    return null
})

export const InAppProductsContainer = memo(() => {
    return <InAppLogicContainer />
})
