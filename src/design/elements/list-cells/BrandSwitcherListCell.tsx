import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { TBaseListCellProps } from '../../types/listCellTypes'
import { Switch } from '../Switch.tsx'

import { BrandBaseListCell } from './BrandBaseListCell/BrandBaseListCell'

type TSwitcherListCellProps = Omit<TBaseListCellProps, 'rightComponent'> & {
    switchValue: boolean
    onSwitchChange: (value: boolean) => void
    testID?: string
}

export const BrandSwitcherListCell = memo(
    ({ title, subtitle, switchValue, onSwitchChange, testID }: TSwitcherListCellProps) => {
        return (
            <BrandBaseListCell
                title={title}
                subtitle={subtitle}
                rightComponent={
                    <Switch
                        value={switchValue}
                        onValueChange={onSwitchChange}
                        style={styles.switch}
                        testID={testID}
                    />
                }
            />
        )
    },
)

const styles = StyleSheet.create({
    switch: {
        marginLeft: 8,
    },
})
