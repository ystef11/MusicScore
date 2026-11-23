export { createSelector } from 'reselect'

// type TUnknownFn = (...rest: any[]) => any

// type TReturn<T> = {
//     [P in keyof T]: T[P] extends TUnknownFn ? ReturnType<T[P]> : never
// }

// export const createSelector = <T>(
//     selectors: TUnknownFn[],
//     combiner: (...args: TReturn<typeof selectors>) => T,
// ) => {
//     return (state: any, props = {} as Record<string, unknown>): ReturnType<typeof combiner> => {
//         const values = selectors.map(selector => selector(state, props))
//         return combiner(...values)
//     }
// }
