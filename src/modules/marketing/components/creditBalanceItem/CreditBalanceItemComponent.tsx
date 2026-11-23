import { memo, useCallback, useEffect } from 'react'

import { analyticsStoreChunk } from '@mu-native/analytics'
import { ListItem } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { marketingStoreChunk, marketingThunks } from '../../index'

type CreditBalanceItemComponent = {
    onPress?: () => void
}

const CreditBalanceItemComponent = ({ onPress }: CreditBalanceItemComponent) => {
    const { navigate } = useAppNavigation()

    const [balance, user, products] = useValues([
        marketingStoreChunk.props.getCreditBalance,
        analyticsStoreChunk.props.getProfile,
        marketingStoreChunk.props.getProducts,
    ])
    const actions = useActions({
        setSource: marketingStoreChunk.actions.setSource,
        loadBalance: marketingThunks.loadUserBalance,
    })
    useEffect(() => {
        if (user.userId) actions.loadBalance()
    }, [user?.userId])

    const openBalanceScreen = useCallback(() => {
        onPress?.()
        navigate(Screen.creditsLandingScreen)
    }, [])

    if (!products.length) return null

    return (
        <ListItem
            title={translate('native.credits.balance_title')}
            subTitle={translate('native.credits.balance_sub_title')}
            isShowArrow
            onPress={openBalanceScreen}
            count={balance}
        />
    )
}

export default memo(CreditBalanceItemComponent)
