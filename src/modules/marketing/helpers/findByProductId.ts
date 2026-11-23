/**
 * Looks a product up by id without assuming the list is well-formed.
 *
 * Callers used to destructure the item directly — `find(({ productId }) => ...)`
 * — where `?.` guards the array but not its elements: a single empty slot throws
 * `Cannot read property 'productId' of undefined` and takes the app down while
 * a paywall is mounting (MUP-14165). The lists come from the store SDK and from
 * persisted state, so neither their presence nor their contents are guaranteed.
 */
export const findByProductId = <T extends { productId?: string }>(
    list: readonly (T | null | undefined)[] | null | undefined,
    productId: string | null | undefined,
): T | undefined => {
    if (!list?.length || !productId) return undefined

    return list.find(item => item?.productId === productId) ?? undefined
}
