import React from 'react'

import { StoreProvider } from '@ug/store'

import { store } from './store'

const StoreContainer = ({ children }: { children: React.ReactNode }) => (
    // @ts-ignore
    <StoreProvider store={store}>{children}</StoreProvider>
)

export default StoreContainer
