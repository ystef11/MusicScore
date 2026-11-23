export const metaStatus = { noError: 0, fileCorrupted: 1, breakLoad: 2, fileTooNew: 3, unknownError: 4 } as const
export const themeMode = { day: 'day', night: 'night' } as const
export const fitMode = { device: 0, original: 1 } as const
export const metronomeMode = { low: 0, high: 1 } as const
export const notation = { standard: 0, tabulature: 1, combine: 2, disabled: 3  } as const
export const playbackStatus = { playing: 0, paused: 1, stopped: 2, empty: 3 } as const
export const scrollMode = { horizontal: 0, vertical: 1, page: 2, multipage: 3 } as const
export const soundFont = { midi: 0, mdl: 1, tabWithEffect: 2 } as const
export const maeMode = { MaeMidiPlayback: 0, MaeAssess: 1 } as const
export const multiMeasureRestMode = { keepOriginal: 0, enable: 1, disable: 2 } as const;

export const MUSESCORE_FORMAT = 'MUSESCORE_ANY' as const;
export const GUITARPRO_FORMAT = 'GUITARPRO_ANY' as const;