import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { TBaseListCellProps } from '../../types/listCellTypes'
import { BrandAppLoader } from '../BrandAppLoader/BrandAppLoader'
import { MuseButton } from '../buttons/MuseButton.tsx'

import { BrandBaseListCell } from './BrandBaseListCell/BrandBaseListCell'

type TButtonListCellProps = Omit<TBaseListCellProps, 'rightComponent'> & {
    loading?: boolean
    buttonText: string
    onButtonPress: () => void
}

export const ButtonListCell = memo(
    ({ title, subtitle, buttonText, onButtonPress, loading = false }: TButtonListCellProps) => {
        const rightComponent = loading ? (
            <BrandAppLoader size="s" />
        ) : (
            <MuseButton
                title={buttonText}
                onPress={onButtonPress}
                type="tertiaryUnderlined"
                style={styles.newButton}
            />
        )
        return (
            <BrandBaseListCell title={title} subtitle={subtitle} rightComponent={rightComponent} />
        )
    },
)

const styles = StyleSheet.create({
    newButton: {
        paddingLeft: 0,
        paddingRight: 0,
        marginStart: 8,
    },
})
