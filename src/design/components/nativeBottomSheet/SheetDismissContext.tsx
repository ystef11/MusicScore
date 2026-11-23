import { createContext, useContext } from 'react'

const noop = () => undefined

export const SheetDismissContext = createContext<() => void>(noop)

export const useSheetDismiss = () => useContext(SheetDismissContext)
