import { useWindowDimensions } from './useWindowDimensions'

export const useIsLandscape = () => {
    const { width, height } = useWindowDimensions()
    return width > height
}
