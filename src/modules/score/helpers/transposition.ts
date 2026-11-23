import { transposeChangeValues, transposeDefaultValues } from '../constants/transposition'

const getTransposeByValue = (originalTranspose: string) =>
    transposeChangeValues.find(
        el => el.value === originalTranspose || el.equal === originalTranspose,
    )

const readTransposition = (originalTranspose: string, diff: number) => {
    const original = getTransposeByValue(originalTranspose)
    if (!original) {
        return undefined
    }
    const nextTransposeKey = transposeByDiff(original.key, diff)
    const nextTranspose = getTransposeByKey(nextTransposeKey)

    if (nextTranspose) {
        if (diff <= 0 && nextTranspose.equal) {
            return nextTranspose.equal
        }

        return nextTranspose.value
    }

    return original.value
}

const getTransposeByKey = (key: number) => transposeChangeValues.find(el => el.key === key)

const transposeByDiff = (transposeKey: number, transposeDiff: number): number => {
    let newTransposeKey = transposeKey + transposeDiff

    if (newTransposeKey > 11) {
        newTransposeKey -= 12
    } else if (newTransposeKey < 0) {
        newTransposeKey += 12
    }

    return newTransposeKey
}

export function getOriginalTransposeByCode(originalTransposeCode: number) {
    const defaultTranspose = 'C, a'

    if (originalTransposeCode) {
        const originalTranspose = transposeDefaultValues.find(
            el => el.key === originalTransposeCode,
        )
        if (originalTranspose) return originalTranspose.value
    }

    return defaultTranspose
}

export function getOriginalTransposeByKeySignature(signature: string) {
    const defaultTranspose = 'C, a'

    if (signature) {
        const originalTranspose = transposeDefaultValues.find(
            el =>
                el.value.toLocaleLowerCase() ===
                signature.replace(' major', '').replace(' minor', '').toLowerCase(),
        )
        return originalTranspose?.value
    }

    return defaultTranspose
}

export const transpositionHelpers = {
    readTransposition,
    getOriginalTransposeByCode,
    getOriginalTransposeByKeySignature,
}
