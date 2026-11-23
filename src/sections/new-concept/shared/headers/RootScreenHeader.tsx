import { type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout } from '@mu-native/ds'
import { BannerSaleComponent } from '@mu-native/marketing'

import { GreetingsHeader } from './GreetingsHeader.tsx'

type TProps = {
    // Optional search control (a SearchEntryButton or a DS SearchField); Home
    // passes nothing.
    search?: ReactNode
}

export const RootScreenHeader = ({ search }: TProps) => (
    <View>
        <GreetingsHeader />
        <BannerSaleComponent />
        {!!search && <View style={styles.searchEntry}>{search}</View>}
    </View>
)

const styles = StyleSheet.create({
    searchEntry: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: layout.marginMd,
    },
})
