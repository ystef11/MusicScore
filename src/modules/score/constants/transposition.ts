import { TTranspose } from '../types/transpositionTypes.ts'

export const transposeDefaultValues = [
    {
        key: -7,
        keysig: '7 flats',
        value: 'C♭, a♭',
    },
    {
        key: -6,
        keysig: '6 flats',
        value: 'G♭, e♭',
    },
    {
        key: -5,
        keysig: '5 flats',
        value: 'D♭, b♭',
    },
    {
        key: -4,
        keysig: '4 flats',
        value: 'A♭, f',
    },
    {
        key: -3,
        keysig: '3 flats',
        value: 'E♭, c',
    },
    {
        key: -2,
        keysig: '2 flats',
        value: 'B♭, g',
    },
    {
        key: -1,
        keysig: '1 flat',
        value: 'F, d',
    },
    {
        key: 0,
        keysig: 'natural',
        value: 'C, a',
    },
    {
        key: 1,
        keysig: '1 sharp',
        value: 'G, e',
    },
    {
        key: 2,
        keysig: '2 sharps',
        value: 'D, b',
    },
    {
        key: 3,
        keysig: '3 sharps',
        value: 'A, f♯',
    },
    {
        key: 4,
        keysig: '4 sharps',
        value: 'E, c♯',
    },
    {
        key: 5,
        keysig: '5 sharps',
        value: 'B, g♯',
    },
    {
        key: 6,
        keysig: '6 sharps',
        value: 'F♯, d♯',
    },
    {
        key: 7,
        keysig: '7 sharps',
        value: 'С♯, a♯',
    },
] as const

export const transposeChangeValues: TTranspose[] = [
    {
        key: 0,
        value: 'C, a',
    },
    {
        key: 1,
        value: 'С♯, a♯',
        equal: 'D♭, b♭',
    },
    {
        key: 2,
        value: 'D, b',
    },
    {
        key: 3,
        value: 'E♭, c',
    },
    {
        key: 4,
        value: 'E, c♯',
    },
    {
        key: 5,
        value: 'F, d',
    },
    {
        key: 6,
        value: 'F♯, d♯',
        equal: 'G♭, e♭',
    },
    {
        key: 7,
        value: 'G, e',
    },
    {
        key: 8,
        value: 'A♭, f',
    },
    {
        key: 9,
        value: 'A, f♯',
    },
    {
        key: 10,
        value: 'B♭, g',
    },
    {
        key: 11,
        value: 'B, g♯',
        equal: 'C♭, a♭',
    },
]
