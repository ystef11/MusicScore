import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
    type AnnotationPage,
    DEFAULT_DRAWING_TOOL,
    DEFAULT_HIGHLIGHTER_TOOL,
    DEFAULT_TEXT_TOOL,
    type DrawingMode,
    type DrawingTool,
    PdfViewer,
    type PdfViewerRef,
} from 'react-native-pdf-light'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { platform } from '@mu-native/common'
import {
    AppText,
    FloatButton,
    globalStyles,
    Icon,
    IconSource,
    layout,
    NativeBottomSheet,
    NativeBottomSheetRef,
    Slider,
    useAppSafeArea,
} from '@mu-native/ds'
import { closeCompact } from '@mu-native/icons/closeCompact'
import { eraser } from '@mu-native/icons/eraser'
import { highlighter } from '@mu-native/icons/highlighter'
import { pencil } from '@mu-native/icons/pencil'
import { redo } from '@mu-native/icons/redo'
import { rename } from '@mu-native/icons/rename'
import { undo } from '@mu-native/icons/undo'
import { translate } from '@mu-native/locale'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'
import ColorPicker, { HueSlider, Panel1, Swatches } from 'reanimated-color-picker'

import type { MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics.ts'

const AUTOSAVE_DEBOUNCE_MS = 1500

const annotationsResultToArray = (
    result: Record<string, { strokes?: AnnotationPage['strokes']; text?: AnnotationPage['text'] }>,
): AnnotationPage[] => {
    const pageKeys = Object.keys(result).map(Number)
    const maxPage = pageKeys.length > 0 ? Math.max(...pageKeys) : -1
    const annotationsArray: AnnotationPage[] = []
    for (let i = 0; i <= maxPage; i++) {
        const page = result[String(i)]
        annotationsArray.push({
            strokes: page?.strokes || [],
            text: page?.text || [],
        })
    }
    return annotationsArray
}

const ANNOTATION_TOOL_NAMES: Record<DrawingMode, string | undefined> = {
    draw: 'pen tool',
    highlight: 'highlighter tool',
    text: 'text tool',
    erase: 'eraser',
    view: undefined,
}

const TOOLBAR_COLOR = '#2D2B55'

const PEN_SIZE_MIN = 4
const PEN_SIZE_MAX = 36
const PEN_SIZE_DEFAULT = 4
const HIGHLIGHT_SIZE_MIN = 4
const HIGHLIGHT_SIZE_MAX = 36
const TEXT_SIZE_MIN = 12
const TEXT_SIZE_MAX = 32

type SizeConfig = {
    label: string
    min: number
    max: number
    step: number
    value: number
    onChange: (value: number) => void
}

type ToolButton = {
    mode: DrawingMode
    icon: IconSource
}

const TOOLS: ToolButton[] = [
    { mode: 'draw', icon: pencil },
    { mode: 'highlight', icon: highlighter },
    { mode: 'text', icon: rename },
    { mode: 'erase', icon: eraser },
]

const SWATCH_COLORS = [
    '#000000',
    '#FF0000',
    '#FF8800',
    '#FFFF00',
    '#00FF00',
    '#0088FF',
    '#0000FF',
    '#8800FF',
    '#FF00FF',
    '#FFFFFF',
]

// reanimated-color-picker returns hex in #RRGGBBAA form (alpha last, web standard).
// Android Color.parseColor expects 8-digit hex as #AARRGGBB (alpha first), so yellow
// #ffff00ff is read as magenta. Strip the alpha suffix — opacity travels via tool.opacity.
const to6DigitHex = (hex: string): string => {
    if (hex.length === 9) return hex.slice(0, 7)
    if (hex.length === 5) return hex.slice(0, 4)
    return hex
}

export const PdfDrawingScreen = memo(() => {
    const insets = useSafeAreaInsets()
    const { uri } = useAppRoute<{ uri: string; score: MSScoreT }>()
    const { goBack } = useAppNavigation()

    const [existingAnnotations, pageLayoutType] = useValues([
        scoreStoreChunk.props.getPdfAnnotations,
        scoreStoreChunk.props.getPageLayoutType,
    ])
    const { setPdfAnnotations, saveAnnotations } = useActions({
        setPdfAnnotations: scoreStoreChunk.actions.setPdfAnnotations,
        saveAnnotations: scoreThunks.saveAnnotations,
    })

    const pdfViewRef = useRef<PdfViewerRef>(null)
    const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [drawingMode, setDrawingMode] = useState<DrawingMode>('view')
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)
    const [selectedColor, setSelectedColor] = useState(DEFAULT_DRAWING_TOOL.color)
    const [sliderVisible, setSliderVisible] = useState(false)
    const [penSize, setPenSize] = useState(PEN_SIZE_DEFAULT)
    const [highlightSize, setHighlightSize] = useState(DEFAULT_HIGHLIGHTER_TOOL.strokeWidth)
    const [textSize, setTextSize] = useState(DEFAULT_TEXT_TOOL.fontSize)
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const { top: paddingTop } = useAppSafeArea({ top: 20 })

    const drawingTool: DrawingTool = useMemo(() => {
        const tool: DrawingTool =
            drawingMode === 'highlight'
                ? {
                      ...DEFAULT_HIGHLIGHTER_TOOL,
                      color: selectedColor,
                      strokeWidth: highlightSize,
                  }
                : { ...DEFAULT_DRAWING_TOOL, color: selectedColor, strokeWidth: penSize }
        return tool
    }, [drawingMode, selectedColor, penSize, highlightSize])

    const textTool = useMemo(() => {
        const tool = { ...DEFAULT_TEXT_TOOL, color: selectedColor, fontSize: textSize }
        return tool
    }, [selectedColor, textSize])

    const handleLoadComplete = useCallback(() => {
        if (existingAnnotations && existingAnnotations.length > 0) {
            pdfViewRef.current?.loadAnnotations(existingAnnotations)
        }
    }, [existingAnnotations])

    const collectCurrentAnnotations = useCallback(async (): Promise<AnnotationPage[] | null> => {
        const result = await pdfViewRef.current?.getAnnotations()
        return result ? annotationsResultToArray(result) : null
    }, [])

    const persistAnnotations = useCallback(
        async (annotationsArray: AnnotationPage[]) => {
            setPdfAnnotations(annotationsArray)
            try {
                await saveAnnotations(annotationsArray)
            } catch {
                // Swallow – thunk already reports to Sentry. The local copy
                // is already in Redux so we don't lose the user's work.
            }
        },
        [setPdfAnnotations, saveAnnotations],
    )

    const scheduleAutosave = useCallback(() => {
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
        autosaveTimerRef.current = setTimeout(async () => {
            autosaveTimerRef.current = null
            const annotationsArray = await collectCurrentAnnotations()
            if (annotationsArray) persistAnnotations(annotationsArray)
        }, AUTOSAVE_DEBOUNCE_MS)
    }, [collectCurrentAnnotations, persistAnnotations])

    useEffect(() => {
        return () => {
            if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
        }
    }, [])

    const handleToolPress = useCallback((mode: DrawingMode) => {
        setDrawingMode(prev => {
            const next = prev === mode ? 'view' : mode
            const toolName = ANNOTATION_TOOL_NAMES[next]
            if (toolName) {
                reportEvent(RT_EVENTS.CLICK_ANNOTATION, { tool: toolName })
            }
            setSliderVisible(next === 'draw' || next === 'highlight' || next === 'text')
            return next
        })
    }, [])

    const handleClose = useCallback(async () => {
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current)
            autosaveTimerRef.current = null
        }
        const annotationsArray = await collectCurrentAnnotations()
        if (annotationsArray) {
            await persistAnnotations(annotationsArray)
        }
        goBack()
    }, [collectCurrentAnnotations, persistAnnotations, goBack])

    const onColorSelect = useCallback((color: { hex: string }) => {
        const normalized = to6DigitHex(color.hex)
        setSelectedColor(normalized)
    }, [])

    const sizeConfig: SizeConfig | null = useMemo(() => {
        if (drawingMode === 'draw') {
            return {
                label: translate('native.score.annotation.pen_size'),
                min: PEN_SIZE_MIN,
                max: PEN_SIZE_MAX,
                step: 1,
                value: penSize,
                onChange: setPenSize,
            }
        }
        if (drawingMode === 'highlight') {
            return {
                label: translate('native.score.annotation.highlight_size'),
                min: HIGHLIGHT_SIZE_MIN,
                max: HIGHLIGHT_SIZE_MAX,
                step: 1,
                value: highlightSize,
                onChange: setHighlightSize,
            }
        }
        if (drawingMode === 'text') {
            return {
                label: translate('native.score.annotation.text_size'),
                min: TEXT_SIZE_MIN,
                max: TEXT_SIZE_MAX,
                step: 1,
                value: textSize,
                onChange: setTextSize,
            }
        }
        return null
    }, [drawingMode, penSize, highlightSize, textSize])

    const showSlider = sliderVisible && sizeConfig !== null

    return (
        <View style={styles.container}>
            <PdfViewer
                viewerType={pageLayoutType === 'horizontal' ? 'paging' : 'zoomable'}
                ref={pdfViewRef}
                source={uri}
                minZoom={1}
                maxZoom={2}
                backgroundColor={colors.pdfBg}
                edgeTapZone={30}
                drawingMode={drawingMode}
                drawingTool={drawingTool}
                textTool={textTool}
                onDrawingStart={() => setSliderVisible(false)}
                onDrawingEnd={() => {
                    setSliderVisible(true)
                    scheduleAutosave()
                }}
                onUndoStateChange={state => {
                    setCanUndo(state.canUndo)
                    setCanRedo(state.canRedo)
                }}
                onLoadComplete={handleLoadComplete}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onZoomChange={() => {}}
                onError={e => console.warn('PDF Error:', e.message)}
                style={styles.pdfView}
            />

            <View style={[styles.topControlsRow, { marginTop: paddingTop + 20 }]}>
                <FloatButton
                    onPress={handleClose}
                    endIcon={closeCompact}
                    size={platform.isTablet ? 'large' : 'small'}
                />
                <View style={styles.undoRedoColumn}>
                    <FloatButton
                        endIcon={undo}
                        disabled={!canUndo}
                        size={platform.isTablet ? 'large' : 'small'}
                        onPress={() => pdfViewRef.current?.undo()}
                    />
                    <FloatButton
                        endIcon={redo}
                        disabled={!canRedo}
                        size={platform.isTablet ? 'large' : 'small'}
                        onPress={() => pdfViewRef.current?.redo()}
                    />
                </View>
            </View>

            {/* Bottom toolbar */}
            <SafeAreaView style={styles.bottomContainer} pointerEvents="box-none">
                {showSlider && sizeConfig && (
                    <View style={styles.sizePanel}>
                        <AppText
                            rawColor={colors.iconInactive}
                            rawText={`${sizeConfig.label}  ${Math.round(sizeConfig.value)}`}
                            style={styles.sizePanelLabel}
                        />
                        <Slider
                            style={globalStyles.fullWidth}
                            value={sizeConfig.value}
                            minimumValue={sizeConfig.min}
                            maximumValue={sizeConfig.max}
                            step={sizeConfig.step}
                            onValueChange={sizeConfig.onChange}
                            minimumTrackTintColor={colors.iconInactive}
                            maximumTrackTintColor="rgba(255,255,255,0.3)"
                            bubbleBackgroundColor={colors.iconInactive}
                        />
                    </View>
                )}
                <View style={styles.toolbarRow}>
                    <View style={styles.toolbar}>
                        {TOOLS.map(tool => {
                            const isActive = drawingMode === tool.mode
                            return (
                                <TouchableOpacity
                                    key={tool.mode}
                                    style={styles.toolButton}
                                    onPress={() => handleToolPress(tool.mode)}
                                >
                                    <Icon
                                        source={tool.icon}
                                        tint={isActive ? colors.iconActive : colors.iconInactive}
                                    />
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View style={[styles.toolbar, styles.colorPickerToolbar]}>
                        {/* Color picker circle */}
                        <TouchableOpacity
                            style={styles.colorPickerButton}
                            onPress={() => sheetRef.current?.present()}
                        >
                            <Image
                                source={require('./assets/ic_color.png')}
                                style={styles.colorIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <NativeBottomSheet ref={sheetRef}>
                <TouchableOpacity
                    activeOpacity={1}
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    onPress={() => {}}
                    style={styles.modalContent}
                >
                    <ColorPicker
                        value={selectedColor}
                        onChangeJS={onColorSelect}
                        style={styles.colorPicker}
                    >
                        <Panel1 style={styles.colorPanel} />
                        <HueSlider style={styles.hueSlider} />
                        <Swatches colors={SWATCH_COLORS} style={styles.swatches} />
                    </ColorPicker>
                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => sheetRef.current?.dismiss()}
                    >
                        <Text style={styles.doneButtonText}>
                            {translate('native.actions.done')}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </NativeBottomSheet>
        </View>
    )
})

const colors = {
    container: '#333',
    pdfBg: '#ffffff',
    iconActive: '#19F3FF',
    iconInactive: 'white',
    toolButtonActive: 'rgba(255,255,255,0.15)',
    colorRingBorder: '#FF4500',
    colorRingShadow: '#FF00FF',
    modalOverlay: 'rgba(0,0,0,0.5)',
    modalBg: '#fff',
    modalHandle: '#ccc',
    modalTitle: '#333',
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.container,
    },
    pdfView: {
        flex: 1,
    },
    floatingButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: TOOLBAR_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 8,
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
    },
    toolbarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    sizePanel: {
        backgroundColor: TOOLBAR_COLOR,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 4,
        minWidth: 280,
        alignSelf: 'stretch',
        marginHorizontal: 16,
    },
    sizePanelLabel: {
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TOOLBAR_COLOR,
        borderRadius: 22,
        paddingHorizontal: 12,
        gap: 4,
        height: 44,
    },
    toolButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorPickerButton: {
        marginLeft: 4,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorPickerToolbar: {
        width: 44,
        paddingHorizontal: 0,
    },
    colorIcon: {
        width: 20,
        height: 20,
    },
    topControlsRow: {
        marginHorizontal: layout.baseMarginFromEdges,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 2,
        flex: 1,
        left: 0,
        right: 0,
        position: 'absolute',
    },
    undoRedoColumn: {
        gap: 8,
    },
    modalContent: {
        backgroundColor: colors.modalBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 12,
    },
    colorPicker: {
        gap: 16,
    },
    colorPanel: {
        height: 200,
        borderRadius: 12,
    },
    hueSlider: {
        height: 32,
        borderRadius: 16,
    },
    swatches: {
        justifyContent: 'center',
        gap: 8,
    },
    doneButton: {
        marginTop: 20,
        backgroundColor: TOOLBAR_COLOR,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    // eslint-disable-next-line react-native/no-color-literals
    doneButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
})
