import {TMultiMeasureRestMode, TXTZInstance, TXTZPlayer} from "./types";
import { initialize } from "./initialize";
import {
  TScrollModeValue,
  TSoundFontValue,
  TThemeModeValue,
  TColorScheme,
  TFormat,
  Listener,
  TMeta,
  TOnScroll,
  TJsonParams,
  TNotationModeValue,
  TSpacing,
  TStatusMetaValue,
  XtzEventMap,
} from "./types";
import Logger from "./utils/logger";

/**
 * API for working with the XTZ player. The first time you import the "@xtz/muse-rn" package, xtz will be initialized in the application's memory.
 *
 * ```ts
 *  # First import = initialization
 *  import { xtz } from "@xtz/muse-rn";
 *  ```
 */
class XTZ implements TXTZInstance {
  /**
   * The debug mode that is set when opening a file;
   * @private
   * @defaultValue false
   * @type boolean
   */
  private debugMode: boolean = false;

  /**
   * XTZ-player version
   * @private
   * @defaultValue false
   * @type String
   * @readonly
   * @example
   * Here's an example with version:
   * ```ts
   *  // Prints "4.0.0-assessment.devel.17241043617":
   *  console.log(xtz.getVersion());
   *  ```
   */
  public version: string;

  /**
   * Внутренний нативный экземпляр плеера.
   * Используется для взаимодействия с низкоуровневым API.
   * @private
   */
  private readonly nativeInstance: TXTZPlayer;


  /**
   * Logger instance that knows about debug mode
   * @private
   */
  private logger: Logger;

  /**
   * @private
   */
  constructor() {
    this.nativeInstance = initialize();

    this.version = this.nativeInstance.getVersion();
    this.debugMode = this.version?.includes("devel")
    this.logger = new Logger(this.debugMode);
    this.logger.info(`version xtz: ${this.version}`);
  }

  /**
   * @private
   */
  private eventListener<K extends keyof XtzEventMap>(event: K, callback: XtzEventMap[K]): Listener {
    this.logger.event(`${event}:  ${JSON.stringify(callback)}!`);
    const unsubscription = this.nativeInstance.on(event, callback);
    this.logger.event(`subscribe addOn${event.substring(1)} success!`);

    return () => {
      this.logger.event(`unsubscribe addOn${event.substring(1)} clear success!`);
      unsubscription?.();
    };
  }

  /**
   * Open file in Xtz. Supported files are .mscz, .gp, .gpx. Start opening a file {@link addListenerOnLoadingStarted} and event after opening a file {@link addListenerOnLoaded}
   * @param path - path to file on mobile device;
   * @param format - see {@link TFormat}
   * @param jsonParams - see {@link TJsonParams}
   * @example
   * Open file:
   *  ```tsx
   *   import { metaStatus, TStatusMetaValue } from "@xtz/muse-rn"
   *   xtz.open("/path/anyFile.gp", GUITARPRO_FORMAT, { noteSize: 4 })
   *
   *   useEffect(() => {
   *        const unsubscribeStarted = xtz.addListenerOnLoadingStarted(() => console.log(`Start Loading`))
   *        const unsubscribeEnd = xtz.addListenerOnLoaded(({ status, meta }) => {
   *
   *          if (status == metaStatus.noError) {
   *            console.log(`Notation opened successfully`)
   *          }
   *          if (status == metaStatus.fileCorrupted) {
   *            console.error(`It is necessary to report to Sentry or another service for analytics`)
   *          }
   *            if (status == metaStatus.breakLoad) {
   *            console.error(`Stopped opening with xtz.cancelLoad() or another method`)
   *          }
   *          if (status == metaStatus.fileTooNew) {
   *            console.warn(`XTZ does not support the current version of the file.`)
   *          }
   *          if (status == metaStatus.unknownError) {
   *            console.error(`It is necessary to report to Sentry or another service for analytics`)
   *          }
   *        })
   *
   *        return () => {
   *             unsubscribeStarted?.();
   *             unsubscribeEnd?.();
   *         }
   *     }, [])
   *  ```
   **/
  open(path: string, format: TFormat, jsonParams?: TJsonParams) {
    this.logger.event(`call func open successfully with path ${path}, format ${format}, jsonParams ${JSON.stringify(jsonParams)}`);
    return this.nativeInstance.open(path, format, jsonParams);
  }

  /**
   * To use the SDK's debug mode, you must enable it or use the "devel" build. Displays additional logs in the console for developers.
   * @param enabled - enable or disable debug mode
   * @defaultValue The default is `false` unless
   */
  setEnabledDebugMode(enabled: boolean): void {
    this.logger.event(`call func setEnabledDebugMode with enabled ${enabled}`);
    this.logger.setDebugMode(enabled)
    return this.nativeInstance.setEnabledDebugMode(enabled);
  }

  /**
   * Current version of XTZ SDK.
   * @readonly
   * @example
   * Here's an example with version:
   * ```ts
   *  // Prints "4.0.0-assessment.devel.17241043617":
   *  console.log(xtz.getVersion());
   *  ```
   **/

  getVersion(): string {
    this.logger.event(`call func getVersion successfully`);
    return this.nativeInstance.getVersion();
  }

  /**
   * Open a new page for notation. Page numbering starts from 1. The max pages can be found in the {@link addListenerOnLoaded} event, see {@link TMeta} totalPages.
   * @param page - open new page
   * @defaultValue 1
   **/

  setPage(page: number) {
    this.logger.event(`call func setPage successfully with page ${page}`);
    return this.nativeInstance.setPage(page);
  }

  /**
   * @deprecated
   * @param pdfPath 
   * @param pathToSave 
   * @returns 
   */
  prepare(pdfPath: string, pathToSave: string): void {
    this.logger.event(`call func prepare successfully pdfPath ${pdfPath} and pathToSave ${pathToSave}`);
    return this.nativeInstance.prepare(pdfPath, pathToSave);
  }

  /**
   * Play file. First you need to install the default soundfont {@link setSoundFont}. See result {@link addListenerOnMaeAssessmentDone}
   * @param maeEnabled - enable playback analysis
   * @param pathMae - path to save playback analysis result
   * @example
   * Default playback:
   *  ```ts
   *   xtz.play()
   *  ```
   *
   *  @example
   * Autograde playback:
   *  ```ts
   *   xtz.play(true, "./storage/folder/")
   *  ```
   **/

  play(maeEnabled = false, pathMae = ""): void {
    this.logger.event(
        `call func play successfully maeEnabled ${maeEnabled} and pathMae ${pathMae}`,
      );
    return this.nativeInstance.play(maeEnabled, pathMae);
  }

  /**
   * Stop playback and move the cursor to the start. See status changes {@link addListenerOnPlaybackStatusChanged}
   **/
  stop(): void {
    this.logger.event(`call func stop successfully`);
    return this.nativeInstance.stop();
  }

  /**
   * Pause playback. See status changes {@link addListenerOnPlaybackStatusChanged}
   **/
  pause(): void {
    this.logger.event(`call func pause successfully`);
    return this.nativeInstance.pause();
  }

  /**
   * Cancel opening of a notation. Called to cancel a method {@link open}
   **/
  cancelLoad(): void {
    this.logger.event(`call func cancelLoad successfully`);
    return this.nativeInstance.cancelLoad();
  }

  /**
   * Scroll the notation to the desired Y and X coordinate; The total height and width can be seen in the event {@link addListenerOnCanvasSizeChanged}
   * @param x - int
   * @param y - int
   **/
  setScrollOffset(x: number, y: number): void {
    this.logger.event(
        `call func setScrollOffset successfully with x ${x} and y ${y}`,
      );
    return this.nativeInstance.setScrollOffset(x, y);
  }

  /**
   * Necessary for initialization of default soundfont in .sf2 or .sf3 formats. Failure to install the soundfont will result in an event {@link addListenerOnSoundFontLoadFailed}.
   * @param path - enable playback analysis
   * @param type - see {@link soundFont}. @{@link midi} - General Midi,@{@link mdl} - MDL Extension for MuseScore, {@link tabWithEffect} - extension for tab notation, includes guitar effects.
   *
   * @example
   * Default install:
   *  ```ts
   *   xtz.setSoundFont("./default.sf3", soundFont.tabWithEffect)
   *  ```
   **/
  setSoundFont(path: string, type: TSoundFontValue) {
    this.logger.event(
        `call func setSoundFont successfully with type ${type} and soundFont ${path}`,
      );
    return this.nativeInstance.setSoundFont(path, type);
  }

  /**
   * Change pitch from -12 to 12.
   * @param pitch - current pitch
   * @type int
   * @defaultValue 0
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setGeneralPitch(0)
   *  ```
   **/
  setGeneralPitch(pitch: number) {
    this.logger.event(
        `call func setGeneralPitch successfully with pitch ${pitch}`,
      );
    return this.nativeInstance.setGeneralPitch(pitch);
  }

  /**
   * Change the display of the notation
   * @param notation - see {@link notation}. @{@link disabled} - default, @{@link standard}, {@link tabulature}, {@link combine}.
   * @type int
   * @defaultValue 0
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setNotationMode(notation.tabulature)
   *  ```
   **/

  setNotationMode(notation: TNotationModeValue) {
    this.logger.event(
        `call func setNotationMode successfully with notation ${notation}`,
      );
    return this.nativeInstance.setNotationMode(notation);
  }

  /**
   * Change the display of the notation
   * @param mode - see {@link scrollMode}. {@link vertical} - vertical scroll, {@link page} - pagination (1 page is visible), {@link multipage} - pagination (all pages are visible)
   * @type int
   * @defaultValue 0
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setScrollMode(scrollMode.vertical)
   *  ```
   **/
  setScrollMode(mode: TScrollModeValue) {
    this.logger.event(`call func setScrollMode successfully with ${mode}`);
    return this.nativeInstance.setScrollMode(mode);
  }

  /**
   * Get Meta file. See result {@link addListenerOnMetaInfoRead}
   * @param path - path to .gp or .mscz;
   * @param format - see {@link TFormat}
   * @param jsonParams - see {@link TJsonParams}
   * @example
   * Example:
   *  ```ts
   *   xtz.getMeta("/path/anyFile.gp", GUITARPRO_FORMAT, { fitMode: 1, scrollMode: 0 })
   *  ```
   **/
  getMeta(
    path: string,
    format: TFormat,
    jsonParams?: TJsonParams,
  ): void {
    this.logger.event(
        `call func getMeta successfully path ${path} and format ${format}, jsonParams ${JSON.stringify(jsonParams)}`,
      );
    return this.nativeInstance.getMeta(path, format, jsonParams);
  }

  // Move playback position to the beginning of the score/tab
  rewind(): void {
    this.logger.event(`call func rewind successfully`);
    return this.nativeInstance.rewind();
  }

  /**
   * Clear last opened tab from memory
   *
   **/
  clearScore(): void {
    this.logger.event(`call func clearScore successfully`);
    return this.nativeInstance.clearScore();
  }

  /**
   * Export file in JSON format. See result event {@link addListenerOnExportedToJson}
   **/
  exportToJson(): void {
    this.logger.event(`call func exportToJson successfully`);
    return this.nativeInstance.exportToJson();
  }

  /**
   * Plays chords that cursor is currently on
   *
   **/
  playCurrentChord(): void {
    this.logger.event(`call func playCurrentChord successfully`);
    return this.nativeInstance.playCurrentChord();
  }

  /**
   * position camera to fit entire score
   **/
  fitScoreToScreen(): void {
    this.logger.event(`call func fitScoreToScreen successfully`);
    return this.nativeInstance.fitScoreToScreen();
  }

  /**
   * Returning camera to default position
   **/
  moveCameraToDefaultZ(): void {
    this.logger.event(`call func moveCameraToDefaultZ successfully`);
    return this.nativeInstance.moveCameraToDefaultZ();
  }

  /**
   * Highlight the first assessment mistake and move camera to it
   **/
  displayFirstMaeMistake(): void {
    this.logger.event(`call func displayFirstMaeMistake successfully`);
    return this.nativeInstance.displayFirstMaeMistake();
  }

  /**
   * Installs additional fonts. Must be done before opening the notation, before calling {@link open} in MU app.
   **/
  tryLoadingAdditionalFonts(): void {
    this.logger.event(`call func tryLoadingAdditionalFonts successfully`);
    return this.nativeInstance.tryLoadingAdditionalFonts();
  }

  /**
   * Move the cursor to the previous playing sound
   **/
  movePlaybackPositionToPrevBit(): void {
    this.logger.event(`call func movePlaybackPositionToPrevBit successfully`);
    return this.nativeInstance.movePlaybackPositionToPrevBit();
  }

  /**
   * Move the cursor to the next sound being played
   **/
  movePlaybackPositionToNextBit(): void {
    this.logger.event(`call func movePlaybackPositionToNextBit successfully`);
    return this.nativeInstance.movePlaybackPositionToNextBit();
  }

  /**
   * Move cursor to next measure
   **/
  movePlaybackPositionToNextMeasure(): void {
    this.logger.event(`call func movePlaybackPositionToNextMeasure successfully`);
    return this.nativeInstance.movePlaybackPositionToNextMeasure();
  }

  /**
   * Move cursor to previous measure
   **/
  movePlaybackPositionToPrevMeasure(): void {
    this.logger.event(`call func movePlaybackPositionToPrevMeasure successfully`);
    return this.nativeInstance.movePlaybackPositionToPrevMeasure();
  }

  /**
   * Playback speed of all tracks in the range `[0; ∞]`. For example: `0.5` — 2 times slower; `1.0` — original; `2.0` — 2x faster;
   * @param speed - audio playback speed.
   * @type float
   * @defaultValue 1.0
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setPlaybackSpeed(1.0)
   *  ```
   **/
  setPlaybackSpeed(speed: number): void {
    this.logger.event(
        `call func setPlaybackSpeed successfully with speed ${speed}`,
      );
    return this.nativeInstance.setPlaybackSpeed(speed);
  }

  /**
   * Change metronome volume (min - 0, max - 100)
   * @param volume
   * @type float
   * @example
   * Example:
   *  ```ts
   *   xtz.setMetronomeVolume(1.0)
   *  ```
   **/
  setMetronomeVolume(volume: number): void {
    this.logger.event(
        `call func setMetronomeVolume successfully with volume ${volume}`,
      );
    return this.nativeInstance.setMetronomeVolume(volume);
  }

  /**
   * Enabled or disabled metronome.
   * @param enabled
   * @type boolean
   **/
  setMetronomeEnabledFile(enabled: boolean): void {
    this.logger.event(
        `call func setMetronomeEnabledFile successfully with enabled ${enabled}`,
      );
    return this.nativeInstance.setMetronomeEnabledFile(enabled);
  }

  /**
   * Sets amount of measures which are played during countdown
   * @param factor
   * @type int
   **/
  setCountdownFactor(factor: number): void {
    this.logger.event(
        `call func setCountdownFactor successfully with factor ${factor}`,
      );
    return this.nativeInstance.setCountdownFactor(factor);
  }

  /**
   * Enable countdown after which playback will start
   * @param enabled
   * @type boolean
   **/
  setCountdownEnabled(enabled: boolean): void {
    this.logger.event(
        `call func setCountdownEnabled successfully with enabled ${enabled}`,
      );
    return this.nativeInstance.setCountdownEnabled(enabled);
  }

  /**
   * Export file in base64 format. See result event {@link addListenerOnPrintFinished}
   * @param jsonParams - specify additional parameters for print file
   *
   **/
  print(jsonParams: { title: string; artist: string }): void {
    this.logger.event(
        `call func print successfully with jsonParams ${jsonParams}`,
      );
    return this.nativeInstance.print(jsonParams);
  }

  /**
   * Export file in PDF format. See result event {@link addListenerOnPdfExported}
   * @param pathToSave - path to save pdf
   * @param jsonParams - specify additional parameters for saving pdf
   *
   **/
  exportPdf(
    pathToSave: string,
    jsonParams?: { title: string; artist: string },
  ): void {
    this.logger.event(
        `call func exportPdf successfully with pathToSave ${pathToSave} and jsonParams ${JSON.stringify(jsonParams)}`,
      );
    return this.nativeInstance.exportPdf(pathToSave, jsonParams);
  }

  /**
   * Change current theme
   * @param mode - see {@link themeMode}. @{@link day} - light, @{@link dark} - night
   * @type TThemeModeValue
   * @defaultValue {@link day}
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setTheme(themeMode.day)
   *  ```
   **/

  setTheme(mode: TThemeModeValue): void {
    this.logger.event(`call func setTheme successfully with mode ${mode}`);
    return this.nativeInstance.setTheme(mode);
  }

  /**
   * Change color scheme for night and day theme. See {@link setTheme}. Each parameter is a string representing a color (e.g., in HEX, RGB, or color name format).
   * @param scheme - see {@link themeMode}
   * @type TColorScheme

   * @interface TColorScheme
   * @param {string} [background] - Background color of the application.
   * @param {string} [pageBackground] - Background color of the page or workspace.
   * @param {string} [mainVoiceItems] - Color of main voice items (e.g., note lines or markers).
   * @param {string} [secondaryVoiceItems] - Color of secondary voice items (e.g., additional markers or accents).
   * @param {string} [fretsBackground] - Background color of frets (for guitar interface or staff).
   * @param {string} [fretsError] - Color indicating errors on frets (e.g., highlighting incorrect positions).
   * @param {string} [playbackCursor] - Color of the playback cursor (indicator of current track position).
   * @param {string} [playbackCursorDrop] - Color of the playback cursor when dragging (drag-and-drop).
   * @param {string} [loopBackground] - Background color of the loop area in the track.
   * @param {string} [loopSelectedBackground] - Background color of the selected loop (highlighted loop area).
   * @param {string} [loopBorders] - Color of loop borders (frames or lines around the loop).
   * @param {string} [loopPinBackground] - Background color of the loop pin (marker for loop start/end).
   * @param {string} [loopPinForeground] - Foreground color of the loop pin (text or icon on the pin).
   * @param {string} [countDownForeground] - Foreground color of the countdown (text or numbers).
   * @param {string} [countDownBackground] - Background color of the countdown (area with the timer).
   * @param {string} [incorrectAccuracyNoteHead] - Color of the note head with incorrect accuracy (e.g., note shape on error).
   * @param {string} [incorrectAccuracyNoteBackground] - Background color of the note with incorrect accuracy (note highlighting).
   * @param {string} [incorrectRhythmNoteHead] - Color of the note head with incorrect rhythm (note shape on rhythmic error).
   * @param {string} [incorrectRhythmNoteBackground] - Background color of the note with incorrect rhythm (note highlighting).
   * @param {string} [repeatButtonBg] - Background color of the repeat button (repeat or loop button).
   * @param {string} [menuBgColor] - Background color of the menu (main color of the menu panel).
   * @param {string} [menuBgColorOutline] - Outline color of the menu background (frame or contour of the menu).
   * @param {string} [maeMenuItemActive] - Color of the active MAE menu item (highlighted item in the analysis or editor menu).
   * @param {string} [maeMenuItemInactive] - Color of the inactive MAE menu item (regular menu item).
   * @param {string} [maeMeasureHighlight] - Color of the MAE measure highlight (highlighting of a beat or measure in analysis).
   * @param {string} [semiTransparent] - Semi-transparent color (for overlays or shadows, e.g., RGBA).
   * @param {string} [debugBackground] - Background color of debug information (panel or overlay for debugging).
   * @param {string} [debugForeground] - Foreground color of debug information (text or elements in debug).
   * @param {string} [debugOverlayRed] - Color of the red debug overlay (e.g., for highlighting errors).
   * @param {string} [debugOverlayGreen] - Color of the green debug overlay (e.g., for successful elements).
   * @param {string} [debugOverlayBlue] - Color of the blue debug overlay (e.g., for informational elements).
   * @example
   * Example:
   *  ```ts
   *   xtz.setThemeScheme({
   *     day: {
   *         # main background of score sheet
   *         background: '#F8F8F8',
   *         # for numbers representing frets with wrong value
   *         fretsError: '#F8F8F8',
   *         # for items on 1st voice or with no specific voice (notes, fret numbers, etc)
   *         mainVoiceItems: '#F8F8F8',
   *         # for items on 2, 3, ... voice
   *         secondaryVoiceItems: '#F8F8F8',
   *         pageBackground: '#F8F8F8',
   *         # for squares which are located behind frets (normally are the same color as background)
   *         fretsBackground: '#F8F8F8',
   *         incorrectAccuracyNoteHead: '#F8F8F8',
   *         incorrectAccuracyNoteBackground: '#F8F8F8',
   *         incorrectRhythmNoteHead: '#F8F8F8',
   *         incorrectRhythmNoteBackground: '#F8F8F8',
   *     },
   *     night: {
   *         ...
   *     }
   *     })
   *  ```
   **/
  setThemeScheme(scheme: TColorScheme): void {
    this.logger.event(
        `call func setThemeScheme successfully with scheme ${JSON.stringify(scheme)}`,
      );
    return this.nativeInstance.setThemeScheme(scheme);
  }

  /**
   * Generates results of assessment as pngs and saves them in specified directory
   * @param pathToSave - path to the directory where result should be saved
   * @type string
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.printMaeResults("/storage/")
   *  ```
   **/

  printMaeResults(pathToSave: string): void {
    this.logger.event(
        `call func printMaeResults successfully with pathToSave ${pathToSave}`,
      );
    return this.nativeInstance.printMaeResults(pathToSave);
  }

  /**
   * Change canvas margin. Margin is added to the canvas, see event {@link addListenerOnCanvasSizeChanged}
   * @param margin - see {@link TSpacing}
   * @type TSpacing
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setMargin({ top: 10, bottom: 10, left: 10, right: 10 })
   *  ```
   **/
  setMargin(margin: TSpacing): void {
    this.logger.event(
        `call func setMargin successfully with margin ${JSON.stringify(margin)}`,
      );
    return this.nativeInstance.setMargin(margin);
  }

  /**
   * Allow camera's bouncing
   * @param left
   * @param right
   * @param top
   * @param bottom
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setBouncingSides(left: false, right: false, top: true, bottom: true)
   *  ```
   **/
  setBouncingSides(
    left: boolean,
    right: boolean,
    top: boolean,
    bottom: boolean,
  ): void {
    this.logger.event(
        `call func setBouncingSides successfully with bounce left: ${left}, right: ${right}, top: ${top}, bottom: ${bottom}`,
      );
    return this.nativeInstance.setBouncingSides(left, right, top, bottom);
  }

  /**
   * Change font size for notation. `minNoteSize` and `maxNoteSize` — available after {@link addListenerOnLoaded} event. When zooming or changing any resolution, the event {@link addListenerOnMaxNoteSizeChanged} sends the current maximum font size;
   * @param noteSize - audio playback speed.
   * @type float
   *
   * @defaultValue 4.0
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setPlaybackSpeed(1.0)
   *  ```
   **/
  setNoteSize(noteSize: number): void {
    this.logger.event(
        `call func setNoteSize successfully with noteSize ${JSON.stringify(noteSize)}`,
      );
    return this.nativeInstance.setNoteSize(noteSize);
  }

  /**
   * Change transpose from -12 to 12.
   * @param transpose - current pitch
   * @type float
   * @defaultValue 0
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setTranspose(0)
   *  ```
   **/
  setTranspose(transpose: number): void {
    this.logger.event(
        `call func setTranspose successfully with transpose ${JSON.stringify(transpose)}`,
      );
    return this.nativeInstance.setTranspose(transpose);
  }

  /**
   * @deprecated
   * Set the visibility of the selected track.
   * @param trackIndex
   * @param isVisible
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setTrackVisible(1, true)
   *  ```
   **/
  setTrackVisible(trackIndex: number, isVisible: boolean): void {
    this.logger.event(
        `call func setTrackVisible successfully with trackIndex ${JSON.stringify(trackIndex)} and isVisible ${JSON.stringify(isVisible)}`,
      );
    return this.nativeInstance.setTrackVisible(trackIndex, isVisible);
  }

  /**
   * Install visible parts.
   * @param visibleParts - array with indexes of parts that should be played (the rest are muted)
   *        if visible parts' size is empty or parameter isn't passed, all tracks are visible by default
   *        if visible parts' has only 1 element and it's "-1", all tracks are visible
   *        if visible parts' has only 1 element and it's "-2", the only visible track will be chosen automatically (according to content and instruments' priority)
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setVisibleParts([0,1]), xtz.setVisibleParts([-2])
   *  ```
   **/
  setVisibleParts(visibleParts: number[]): void {
    this.logger.event(
        `call func setVisibleParts successfully with visibleParts ${JSON.stringify(visibleParts)}`,
      );
    return this.nativeInstance.setVisibleParts(visibleParts);
  }

  /**
   * Install playable parts.
   * @param playableParts - array with indexes of parts that should be played (the rest are muted)
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setPlayableParts([0,1])
   *  ```
   **/
  setPlayableParts(playableParts: number[]): void {
    this.logger.event(
        `call func setPlayableParts successfully with playableParts ${JSON.stringify(playableParts)}`,
      );
    return this.nativeInstance.setPlayableParts(playableParts);
  }

  /**
   * Enable or disable YouTube playback mode.
   * @param enable - enable or disable YouTube playback
   * @param timeData - array of time points (required when enable is true)
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.enableYouTubePlayback(true, [0, 1.5, 3.0])
   *   xtz.enableYouTubePlayback(false)
   *  ```
   **/
  enableYouTubePlayback(enable: boolean, timeData?: number[]): void {
    const timeDataStr = timeData ? JSON.stringify(timeData) : "";
    this.logger.event(
      `call func enableYouTubePlayback successfully with enable ${enable} timeData ${timeDataStr}`,
    );
    return this.nativeInstance.enableYouTubePlayback(enable, timeData ? timeData : []);
  }

  /**
   * Sets the camera and/or playback cursor to the beginning of the selected measure
   * @param measureIndex - index of measure in notation
   * @param isRepositionCamera - indicates, if camera should be repositioned to show this measure
   * @param isRepositionPlayback - indicates, if playback should be moved to this measure
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setCurrentMeasure(5, true, true)
   *   note: xtz.setCurrentMeasure(5, false, false) has no effect
   *  ```
   **/
  setCurrentMeasure(
    measureIndex: number,
    isRepositionCamera: boolean,
    isRepositionPlayback: boolean,
  ): void {
    this.logger.event(
        `call func setCurrentMeasure successfully with measureIndex ${measureIndex}, isRepositionCamera: ${isRepositionCamera}, isRepositionPlayback: ${isRepositionPlayback}`,
      );
    this.nativeInstance.setCurrentSecond(
      measureIndex,
      isRepositionCamera,
      isRepositionPlayback,
    );
  }

  /**
   * Sets the camera and/or playback cursor to `%` of score/tab audio length
   * @param percent - `%` of score/tab audio length
   * @param isRepositionCamera - indicates, if camera should be repositioned to show this measure
   * @param isRepositionPlayback - indicates, if playback should be moved to this measure
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.setCurrentPercent(10, true, true)
   *   note: xtz.setCurrentPercent(10, false, false) has no effect
   *  ```
   **/
  setCurrentPercent(
    percent: number,
    isRepositionCamera: boolean,
    isRepositionPlayback: boolean,
  ): void {
    this.logger.event(
        `call func setCurrentPercent successfully with percent ${percent}, isRepositionCamera: ${isRepositionCamera}, isRepositionPlayback: ${isRepositionPlayback}`,
      );
    this.nativeInstance.setCurrentPercent(
      percent,
      isRepositionCamera,
      isRepositionPlayback,
    );
  }

  /**
   * Sets the camera and/or playback cursor to the specified second of audio. See event {@link addListenerOnPlaybackSecondResponse}
   * @param second - specified second of audio
   * @param isRepositionCamera - indicates, if camera should be repositioned to show this measure
   * @param isRepositionPlayback - indicates, if playback should be moved to this measure
   *
   *
   * @example
   * Example:
   *  ```ts
   *   xtz.  setCurrentSecond((10, true, true)
   *    note: xtz.setCurrentSecond(10, false, false) has no effect
   *  ```
   **/

  setCurrentSecond(
    second: number,
    isRepositionCamera: boolean,
    isRepositionPlayback: boolean,
  ): void {
    this.logger.event(
        `call func setCurrentSecond successfully with second ${second}, isRepositionCamera: ${isRepositionCamera}, isRepositionPlayback: ${isRepositionPlayback}`,
      );
    this.nativeInstance.setCurrentSecond(
      second,
      isRepositionCamera,
      isRepositionPlayback,
    );
  }

  /**
   * Manually set loop edges in screen coordinates
   * @param x
   * @param y
   *
   *
   **/
  setLoopEdge(x: number, y: number): void {
    this.logger.event(`call func setLoopEdge successfully with x ${x}, y: ${y}`);
    return this.nativeInstance.setLoopEdge(x, y);
  }

  /**
   * Set loop region by specifying measure indexes
   * @param beginMeasureIndex - measure index to start the loop with
   * @param endMeasureIndex - measure index to end the loop with (-1 means until the end of score/tab)
   *
   **/
  setLoopRegion(beginMeasureIndex: number, endMeasureIndex: number): void {
    this.logger.event(
        `call func setLoopRegion successfully with beginMeasureIndex ${beginMeasureIndex}, endMeasureIndex: ${endMeasureIndex}`,
      );
    this.nativeInstance.setLoopRegion(beginMeasureIndex, endMeasureIndex);
  }

  /**
   * Set "loop" as selection mode (used for playback)
   * In contrast to "range selection" mode, when playback reaches the end of loop, it continues from start
   * @param active
   *
   **/
  setLoopActive(active: boolean): void {
    this.logger.event(
        `call func setLoopActive successfully with active ${active}`,
      );
    this.nativeInstance.setLoopActive(active);
  }

  /**
   * Enable/disable loop
   * @param enabled
   * @defaultValue false
   *
   **/
  setLoopEnabled(enabled: boolean): void {
    this.logger.event(
        `call func setLoopEnabled successfully with enabled ${enabled}`,
      );
    this.nativeInstance.setLoopEnabled(enabled);
  }

  /**
   * Install loop job mode
   * @deprecated
   *
   * @param active
   * @defaultValue false
   *
   **/
  setLoopSetupMode(active: boolean): void {
    this.logger.event(
        `call func setLoopSetupMode successfully with active ${active}`,
      );
    this.nativeInstance.setLoopSetupMode(active);
  }

  /**
   * Set start and end for loop in seconds
   * @param startSecond
   * @param endSecond
   *
   **/
  setLoopRegionFromSecond(startSecond: number, endSecond: number): void {
    this.logger.event(
        `call func setLoopRegionFromSecond successfully with startSecond ${startSecond}, endSecond ${endSecond}`,
      );
    this.nativeInstance.setLoopRegionFromSecond(startSecond, endSecond);
  }

  /**
   * Set the volume of the selected part
   * @param part
   * @param volume
   *
   **/
  setPartVolume(part: number, volume: number): void {
    this.logger.event(
        `call func setPartVolume successfully with part ${part}, volume ${volume}`,
      );
    this.nativeInstance.setPartVolume(part, volume);
  }

  /**
   * Sets path for loading backing track for current track
   * @param track
   * @param uri - path for loading backing track
   *
   **/
  setBackingTrack(track: number, uri: string): void {
    this.logger.event(
        `call func setBackingTrack successfully with track ${track}, uri ${uri}`,
      );
    this.nativeInstance.setBackingTrack(track, uri);
  }

  /**
   * Set playback position
   * @param x - int
   * @param y - int
   *
   **/
  setCursorPosition(x: number, y: number): void {
    this.logger.event(
        `call func setCursorPosition successfully with x ${x}, y ${y}`,
      );
    this.nativeInstance.setCursorPosition(x, y);
  }

  /**
   * Set playHeadVisible
   * @param isVisible - boolean
   *
   **/
  setPlayHeadVisible(isVisible: boolean): void {
    this.logger.event(
        `call func setPlayHeadVisible successfully with isVisible ${isVisible}`,
    );
    this.nativeInstance.setPlayHeadVisible(isVisible);
  }
  /**
   * Set mute track
   * @param track - int
   * @param isMuted - int
   *
   **/
  setAudioTrackMuted(track: number, isMuted: boolean): void {
    this.logger.event(
        `call func setAudioTrackMuted successfully with track ${track}, isMuted ${isMuted}`,
      );
    this.nativeInstance.setAudioTrackMuted(track, isMuted);
  }

  /**
   * Enable or disable the specified backing track in the api. See {@link setBackingTrack}
   * @param enabled
   * @defaultValue false
   *
   **/
  switchOnBackingTracks(enabled: boolean): void {
    this.logger.event(
        `call func switchOnBackingTracks successfully with enabled ${enabled}`,
      );
    this.nativeInstance.switchOnBackingTracks(enabled);
  }

  /**
   * Enable or disable multi measure rests: to save notation's space if many measures in a row are empty
   * While enabled, only 1 measure is drawn and total number of empty measures is shown
   * @param mode defines behavior for multiple empty measures in the row.
   * @defaultValue enable
   *
   **/
  setMultiMeasureRestMode(mode: TMultiMeasureRestMode): void {
    this.logger.event(
        `call func setMultiMeasureRestMode successfully with mode ${mode}`,
      );
    this.nativeInstance.setMultiMeasureRestMode(mode);
  }

  /**
   * Turn lyrics on or off
   * @param enabled
   * @defaultValue false
   *
   **/
  setLyricsEnabled(enabled: boolean): void {
    this.logger.event(
        `call func setLyricsEnabled successfully with enabled ${enabled}`,
      );
    this.nativeInstance.setLyricsEnabled(enabled);
  }
  showLyricsOnEachPart(enabled: boolean): void {
    this.logger.event(
        `call func setLyricsEnabled successfully with enabled ${enabled}`,
      );
    this.nativeInstance.showLyricsOnEachPart(enabled);
  }

  /**
   * Manually set range selection edges in screen coordinates
   * @param x
   * @param y
   *
   **/
  setRangeSelectionEdge(x: number, y: number): void {
    this.logger.event(
        `call func setRangeSelectionEdge successfully with x ${x}, y ${y}`,
      );
    this.nativeInstance.setRangeSelectionEdge(x, y);
  }

  /**
   * Set range seelction region by specifying measure indexes
   * @param beginMeasureIndex - measure index to start the loop with
   * @param endMeasureIndex - measure index to end the loop with (-1 means until the end of score/tab)
   *
   **/
  setRangeSelectionRegion(
    beginMeasureIndex: number,
    endMeasureIndex: number,
  ): void {
    this.logger.event(
        `call func setRangeSelectionRegion successfully with beginMeasureIndex ${beginMeasureIndex}, endMeasureIndex ${endMeasureIndex}`,
      );
    this.nativeInstance.setRangeSelectionRegion(
      beginMeasureIndex,
      endMeasureIndex,
    );
  }

  /**
   * Set "range selection" as selection mode (used for assessment)
   * In contrast to "loop" mode, when playback reaches the end of range selection, it stops
   * @param active
   *
   **/
  setRangeSelectionActive(active: boolean): void {
    this.logger.event(
        `call func setRangeSelectionActive successfully with active ${active}`,
      );
    this.nativeInstance.setRangeSelectionActive(active);
  }

  /**
   * Enable/disable range selection
   * @param enabled
   *
   **/
  setRangeSelectionEnabled(enabled: boolean): void {
    this.logger.event(
        `call func setRangeSelectionEnabled successfully with enabled ${enabled}`,
      );
    this.nativeInstance.setRangeSelectionEnabled(enabled);
  }

  /**
   * Set start and end for range selection in seconds
   * @param startSecond
   * @param endSecond
   *
   **/
  setRangeSelectionRegionFromSec(startSecond: number, endSecond: number): void {
    this.logger.event(
        `call func setRangeSelectionRegionFromSec successfully with startSecond ${startSecond}, endSecond ${endSecond}`,
      );
    this.nativeInstance.setRangeSelectionRegionFromSec(startSecond, endSecond);
  }

  /**
   * Calibrates device for correct assessment (done once)
   *
   **/
  calibrateMae(): void {
    this.logger.event(`call func calibrateMae successfully`);
    this.nativeInstance.calibrateMae();
  }

  /**
   * Set latency value for correct assessment evaluation
   * @param latency - in seconds
   *
   **/
  setMaeLatency(latency: number): void {
    this.logger.event(`call func setMaeLatency successfully latency: ${latency}`);
    this.nativeInstance.setMaeLatency(latency);
  }

  /**
   * Loads previously done assessment session information from the file
   * @param path - file with session information
   *
   **/
  loadMaeSession(path: string): void {
    this.logger.event(`call func loadMaeSession successfully path: ${path}`);
    this.nativeInstance.loadMaeSession(path);
  }

  /**
   * Hides all previously displayed assessment mistakes
   *
   **/
  hideMaeMistakes(): void {
    this.logger.event(`call func hideMaeMistakes successfully`);
    this.nativeInstance.hideMaeMistakes();
  }

  /**
   * Sets tolerance for assessment (float number from 0 to 1)
   * @deprecated
   * @param tolerance
   *
   **/
  setMaeTolerance(tolerance: number): void {
    this.logger.event(
        `call func setMaeTolerance successfully tolerance: ${tolerance}`,
      );
    this.nativeInstance.setMaeTolerance(tolerance);
  }

  /**
   * Loads the chords view content for parsing
   * @param data - raw data from the chords view
   * @param isFromOfficialTab - indicating if the content is loaded from PRO mode or legacy chords
   *
   **/
  smartScrollLoadChords(data: string, isFromOfficialTab: boolean): void {
    this.logger.event(
        `call func smartScrollLoadChords successfully data: ${JSON.stringify(data)}, isFromOfficialTab: ${isFromOfficialTab}`,
      );
    this.nativeInstance.smartScrollLoadChords(data, isFromOfficialTab);
  }

  /**
   * Starts smartscroll engine
   * @param path - path to record the mic input to. Pass empty string to use default path
   * @param enableRec - specifies if input should be recorded
   *
   **/
  smartScrollStart(path: string, enableRec: boolean): void {
    this.logger.event(
        `call func smartScrollStart successfully path: ${path}, enableRec: ${enableRec}`,
      );
    this.nativeInstance.smartScrollStart(path, enableRec);
  }

  /**
   * Stops smartscroll
   *
   **/
  smartScrollStop(): void {
    this.logger.event(`call func smartScrollStop successfully`);
    this.nativeInstance.smartScrollStop();
  }

  /**
   * Resets smartscroll to its initial state, including the current and expected chords
   *
   **/
  smartScrollReset(): void {
    this.logger.event(`call func smartScrollReset successfully`);
    this.nativeInstance.smartScrollReset();
  }

  /**
   * Setting current chord in order to navigate through the song
   * @param chordIndex - index of a chord symbol in the song dataset
   *
   **/
  smartScrollSetCurrentChord(chordIndex: number): void {
    this.logger.event(
        `call func smartScrollSetCurrentChord successfully chordIndex: ${chordIndex}`,
      );
    this.nativeInstance.smartScrollSetCurrentChord(chordIndex);
  }

  /**
   * Sets transpose for smartscroll (in case of using capo)
   * @param transpose - integer between -12 and 12
   *
   **/
  smartScrollSetTranspose(transpose: number): void {
    this.logger.event(
        `call func smartScrollSetTranspose successfully transpose: ${transpose}`,
      );
    this.nativeInstance.smartScrollSetTranspose(transpose);
  }

  /**
   * Sets the recognition engine sensitivity
   * @param sensitivity - A value from 0 to 1.
   *                      Low sensitivity means only the root note is important
   *                      (e.g., if the expected chord is Asus4 but the user plays A, the chord will be recognized as Asus4).
   *                      High sensitivity requires the user to play the exact chord.
   *
   **/
  smartScrollSetSensitivity(sensitivity: number): void {
    this.logger.event(
        `call func smartScrollSetSensitivity successfully transpose: ${sensitivity}`,
      );
    this.nativeInstance.smartScrollSetSensitivity(sensitivity);
  }

  /**
   * Enables soundcheck mode and immediately starts listening to user audio input
   * @param enabled - enables or disables soundcheck mode
   * @param chord - the chord to compare with ("C", "Am", etc)
   *
   **/
  smartScrollSetSoundcheckMode(enabled: boolean, chord: string): void {
    this.logger.event(
        `call func smartScrollSetSoundcheckMode successfully enabled: ${enabled}, chord: ${chord}`,
      );
    this.nativeInstance.smartScrollSetSoundcheckMode(enabled, chord);
  }

  /**
   * Handles the pointer up event by delegating to the native instance.
   * This method is used to handle the release of a pointer (e.g., touch or mouse) at the specified coordinates
   * and pointer index. It logs the event in debug mode and returns the result from the native layer.
   *
   * @param x - The x-coordinate of the pointer event (number).
   * @param y - The y-coordinate of the pointer event (number).
   * @param pointerIndex - The index of the pointer (number, e.g., for multi-touch).
   * @returns A boolean indicating whether the pointer up event was handled successfully.
   *
   * @example
   * ```typescript
   * const result = eventPointerUp(100, 200, 0);
   * console.log('Pointer up handled:', result);
   * ```
   *
   */
  eventPointerUp(x: number, y: number, pointerIndex: number): void {
    this.logger.event(
        `call func eventPointerUp successfully with x ${x} and y ${y}`,
      );
    return this.nativeInstance.eventPointerUp(x, y, pointerIndex);
  }

  /**
   * Handles the pointer move event by delegating to the native instance.
   * This method is used to handle the movement of a pointer (e.g., touch or mouse) at the specified coordinates
   * and pointer index. It logs the event in debug mode and returns the result from the native layer.
   *
   * @param x - The x-coordinate of the pointer event (number).
   * @param y - The y-coordinate of the pointer event (number).
   * @param pointerIndex - The index of the pointer (number, e.g., for multi-touch).
   * @returns A boolean indicating whether the pointer move event was handled successfully.
   *
   * @example
   * ```typescript
   * const result = eventPointerMove(150, 250, 0);
   * console.log('Pointer move handled:', result);
   * ```
   *
   */
  eventPointerMove(x: number, y: number, pointerIndex: number): void {
    this.logger.event(
        `call func eventPointerMove successfully with x ${x} and y ${y}`,
      );
    return this.nativeInstance.eventPointerMove(x, y, pointerIndex);
  }

  /**
   * Handles the pointer down event by delegating to the native instance.
   * This method is used to handle the press of a pointer (e.g., touch or mouse) at the specified coordinates
   * and pointer index. It logs the event in debug mode and returns the result from the native layer.
   *
   * @param x - The x-coordinate of the pointer event (number).
   * @param y - The y-coordinate of the pointer event (number).
   * @param pointerIndex - The index of the pointer (number, e.g., for multi-touch).
   *
   * @example
   * ```typescript
   * const result = eventPointerDown(50, 100, 0);
   * console.log('Pointer down handled:', result);
   * ```
   *
   */
  eventPointerDown(x: number, y: number, pointerIndex: number): void {
    this.logger.event(
        `call func eventPointerDown successfully with x ${x} and y ${y}`,
      );
    return this.nativeInstance.eventPointerDown(x, y, pointerIndex);
  }

  /**
   * Handles the pointer cancel event by delegating to the native instance.
   * This method is used to cancel a pointer event (e.g., touch) at the specified coordinates
   * and pointer index.
   *
   * @param x - The x-coordinate of the pointer event (int).
   * @param y - The y-coordinate of the pointer event (int).
   * @param pointerIndex - The index of the pointer (int, e.g., for multi-touch).
   *
   * @example
   * ```typescript
   * const result = eventPointerCancel(100, 200, 0);
   * console.log('Pointer cancel handled:', result);
   * ```
   *
   */
  eventPointerCancel(x: number, y: number, pointerIndex: number): void {
    this.logger.event(
        `call func eventPointerCancel successfully with x ${x} and y ${y}`,
      );
    return this.nativeInstance.eventPointerCancel(x, y, pointerIndex);
  }

  /**
   * @event
   * @eventProperty
   * Adds a listener for the score loaded event.
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoaded(({ status, data }) => {
   *         if (status == metaStatus.noError) {
   *            console.log(`Notation opened successfully`)
   *          }
   *          if (status == metaStatus.fileCorrupted) {
   *            console.error(`It is necessary to report to Sentry or another service for analytics`)
   *          }
   *            if (status == metaStatus.breakLoad) {
   *            console.error(`Stopped opening with xtz.cancelLoad() or another method`)
   *          }
   *          if (status == metaStatus.fileTooNew) {
   *            console.warn(`XTZ does not support the current version of the file.`)
   *          }
   *          if (status == metaStatus.unknownError) {
   *            console.error(`It is necessary to report to Sentry or another service for analytics`)
   *          }
   * });
   * // Later: unsubscribe?.();
   * ```
   */
  addListenerOnLoaded(
    listener: (data: { status: TStatusMetaValue; data: TMeta }) => void,
  ): Listener {
    return this.eventListener("mNotationLoaded", listener);
  }

  /**
   * Logging events that occur in the chain: TS -> C++
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerLogXtz((message) => {
   *   console.log('XTZ log:', message);
   * });
   * // Later: unsubscribe?.();
   * ```
   */
  addListenerLogXtz(listener: (message: string) => void): Listener {
    this.logger.setCallback(listener);
    const unsubscribe = this.eventListener("mLogger", listener);
    return () => {
      this.logger.setCallback(undefined);
      unsubscribe?.();
    };
  }

  /**
   * Adds a listener for loop enabled state changes. See API {@link setLoopEnabled}
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```typescript
   * xtz.setLoopEnabled(true);
   *
   * const unsubscribe = addListenerOnLoopEnabled((isEnabled) => {
   *   console.log('Loop enabled:', isEnabled);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnLoopEnabled(listener: (isEnabled: boolean) => void): Listener {
    return this.eventListener("mLoopEnable", listener);
  }

  /**
   * Adds a listener for marker added events.
   * This method allows you to subscribe to the `mMarkerAdded` event,
   * which is triggered when a marker is added, providing marker ID and tag.
   *
   * @param listener - A callback function invoked with an object containing `markerId` (number) and `markerTag` (string).
   * @returns A Listener object that can be used to remove the subscription.
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMarkerAdded(({ markerId, markerTag }) => {
   *   console.log(`Marker added: ID=${markerId}, Tag="${markerTag}"`);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnMarkerAdded(
    listener: (data: { markerId: number; markerTag: string }) => void,
  ): Listener {
    return this.eventListener("mMarkerAdded", listener);
  }

  /**
   * Adds a listener for page flipped events.
   * This method allows you to subscribe to the `mPageFlipped` event,
   * which is triggered when a page flip occurs, providing flip status and page indices.
   *
   * @param listener - A callback function invoked with an object containing:
   *   - `flipped` (boolean): whether the page was flipped,
   *   - `current` (number): current page index,
   *   - `wanted` (number): target page index,
   *   - `old` (number): previous page index.
   * @returns A Listener object that can be used to remove the subscription.
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPageFlipped(({ flipped, current, wanted, old }) => {
   *   console.log(`Page flipped: ${flipped}, from ${old} to ${current} (wanted ${wanted})`);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   * @since 1.0.0 - Added to support page flip events in React Native modules.
   */
  addListenerOnPageFlipped(listener: {
    (data: {
      flipped: boolean;
      current: number;
      wanted: number;
      old: number;
    }): void;
  }): Listener {
    return this.eventListener("mPageFlipped", listener);
  }

  /**
   * Adds a listener for note size set events.
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```tsx
   * # xtz.open("file.gp", GUITARPRO_FORMAT, { noteSize: 4 })
   * # or
   * # xtz.setNoteSize(5)
   * # or
   * # ZTZView Zoom
   *
   * const unsubscribe = addListenerOnNoteSizeSet((noteSize) => {
   *   console.log('Note size set to:', noteSize);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnNoteSizeSet(listener: (noteSize: number) => void): Listener {
    return this.eventListener("mNoteSizeSet", listener);
  }

  /**
   * Adds a listener for PDF export completion events.
   * This method allows you to subscribe to the `mPdfExported` event,
   * which is triggered when a PDF export operation completes.
   *
   * @param listener - A callback function invoked with an object containing:
   *   - `success` (boolean): whether the export succeeded,
   *   - `path` (string): the file path of the exported PDF.
   * @returns A Listener object that can be used to remove the subscription.
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPdfExported(({ success, path }) => {
   *   console.log(`PDF export ${success ? 'succeeded' : 'failed'} at path: ${path}`);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnPdfExported(
    listener: (data: { success: boolean; path: string }) => void,
  ): Listener {
    return this.eventListener("mPdfExported", listener);
  }

  /**
   * Adds a listener for file decoded events.
   * This method allows you to subscribe to the `mFileDecoded` event,
   * which is triggered when a file decoding operation completes.
   *
   * @param listener - A callback function invoked with an object containing:
   *   - `success` (boolean): whether decoding succeeded,
   *   - `path` (string): the file path of the decoded file.
   * @returns A Listener object that can be used to remove the subscription.
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnFileDecoded(({ success, path }) => {
   *   console.log(`File decode ${success ? 'succeeded' : 'failed'} at path: ${path}`);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnFileDecoded(
    listener: (data: { success: boolean; path: string }) => void,
  ): Listener {
    return this.eventListener("mFileDecoded", listener);
  }

  /**
   * Adds a listener for meta information read events.
   * This method allows you to subscribe to the `mMetaInfoRead` event,
   * which is triggered when metadata information is read.
   *
   * @param listener - A callback function invoked with metadata of type `TMeta`.
   * @returns A Listener object that can be used to remove the subscription.
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMetaInfoRead((meta) => {
   *   console.log('Meta info read:', meta);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnMetaInfoRead(listener: (data: TMeta) => void): Listener {
    return this.eventListener("mMetaInfoRead", listener);
  }

  /**
   * Adds a listener for backing track loaded events.
   * This method allows you to subscribe to the `mBTrackLoaded` event,
   * which is triggered when a backing track is loaded, providing success status and track number.
   *
   * @param listener - A callback function invoked with:
   *   - `success` (boolean): whether loading succeeded,
   *   - `track` (number): the backing track number.
   * @returns A Listener object that can be used to remove the subscription.
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnBTrackLoaded((success, track) => {
   *   console.log(`Backing track ${track} load ${success ? 'succeeded' : 'failed'}`);
   * });
   * // Later: unsubscribe?.();
   * ```
   *
   */
  addListenerOnBTrackLoaded(
    listener: (success: boolean, track: number) => void,
  ): Listener {
    return this.eventListener("mBTrackLoaded", listener);
  }

  /**
   * Adds a listener for loop start set events.
   * This method allows you to subscribe to the `mLoopStartSet` event,
   * which is triggered when the loop start position is set, providing the measure ID.
   *
   * @param listener - A callback function invoked with the measure ID (number) where the loop starts.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoopStartSet((measureId) => {
   *   console.log('Loop start set at measure:', measureId);
   *   // Update UI to highlight the loop start
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnLoopStartSet(listener: (measureId: number) => void): Listener {
    return this.eventListener("mLoopStartSet", listener);
  }

  /**
   * Adds a listener for the print finished event.
   * This method allows you to subscribe to the `mPrintFinished` event,
   * which is triggered when a print operation completes, providing image data.
   *
   * @param listener - A callback function invoked when printing finishes.
   *   Receives an array of strings representing image data (e.g., base64-encoded images or file paths).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPrintFinished((imageData) => {
   *   console.log('Print finished with images:', imageData);
   *   // Process the image data, e.g., save or display
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnPrintFinished(
    listener: (imageData: string[]) => void,
  ): Listener {
    return this.eventListener("mPrintFinished", listener);
  }

  /**
   * Adds a listener for changes to the loop setup mode event.
   * This method allows you to subscribe to changes of the `mLoopSetupMode` state,
   * which indicates whether the loop setup mode is enabled.
   *
   * @param listener - A callback function invoked when the mode changes.
   *   Receives a boolean value: `true` if the mode is enabled, `false` if disabled.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoopSetupMode((isEnabled) => {
   *   console.log('Loop setup mode is', isEnabled ? 'enabled' : 'disabled');
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnLoopSetupMode(listener: (isEnabled: boolean) => void): Listener {
    return this.eventListener("mLoopSetupMode", listener);
  }

  /**
   * Adds a listener for the loop finish set event.
   * This method allows you to subscribe to the `mLoopFinishSet` event,
   * which is triggered when a loop's finish set is updated, providing the measure ID.
   *
   * @param listener - A callback function invoked when the loop finish set changes.
   *   Receives a number representing the measure ID.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoopFinishSet((measureId) => {
   *   console.log('Loop finish set updated for measure:', measureId);
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnLoopFinishSet(listener: (measureId: number) => void): Listener {
    return this.eventListener("mLoopFinishSet", listener);
  }

  /**
   * Adds a listener for the countdown tick event.
   * This method allows you to subscribe to the `mCountdownTick` event,
   * which is triggered on each tick of a countdown, providing the current tick value.
   *
   * @param listener - A callback function invoked on each countdown tick.
   *   Receives a number representing the current tick (e.g., remaining seconds).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnCountdownTick((tick) => {
   *   console.log('Countdown tick:', tick);
   *   // Update UI with remaining time
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnCountdownTick(listener: (tick: number) => void): Listener {
    return this.eventListener("mCountdownTick", listener);
  }

  /**
   * Adds a listener for the marker removed event.
   * This method allows you to subscribe to the `mMarkerRemoved` event,
   * which is triggered when a marker is removed, providing details about the marker.
   *
   * @param listener - A callback function invoked when a marker is removed.
   *   Receives an object with `markerId` (number) and `markerTag` (string) of the removed marker.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMarkerRemoved((data) => {
   *   console.log('Marker removed:', data.markerId, 'with tag:', data.markerTag);
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnMarkerRemoved(
    listener: (data: { markerId: number; markerTag: string }) => void,
  ): Listener {
    return this.eventListener("mMarkerRemoved", listener);
  }

  /**
   * Adds a listener for the page set changed event.
   * This method allows you to subscribe to the `mPageSetChanged` event,
   * which is triggered when the page set changes, providing current and total page counts.
   *
   * @param listener - A callback function invoked when the page set changes.
   *   Receives an object with `current` (number, current page) and `total` (number, total pages).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPageSetChanged((data) => {
   *   console.log('Page changed to', data.current, 'of', data.total);
   *   // Update pagination UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPageSetChanged(
    listener: (data: { current: number; total: number }) => void,
  ): Listener {
    return this.eventListener("mPageSetChanged", listener);
  }

  /**
   * Adds a listener for the exported to JSON event.
   * This method allows you to subscribe to the `mExportedToJson` event,
   * which is triggered when data is exported to JSON, providing the JSON string.
   *
   * @param listener - A callback function invoked when data is exported to JSON.
   *   Receives a string containing the exported JSON data.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnExportedToJson((jsonStr) => {
   *   console.log('Exported JSON:', jsonStr);
   *   // Save or process the JSON string
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnExportedToJson(listener: (jsonStr: string) => void): Listener {
    return this.eventListener("mExportedToJson", listener);
  }

  /**
   * Adds a listener for the loading started event.
   * This method allows you to subscribe to the `mLoadingStarted` event,
   * which is triggered when a loading process begins.
   *
   * @param listener - A callback function invoked when loading starts.
   *   No parameters are passed.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoadingStarted(() => {
   *   console.log('Loading has started');
   *   // Show loading indicator
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnLoadingStarted(listener: () => void): Listener {
    return this.eventListener("mLoadingStarted", listener);
  }

  /**
   * Adds a listener for the layout did happen event.
   * This method allows you to subscribe to the `mLayoutDidHappen` event,
   * which is triggered after a layout operation completes.
   *
   * @param listener - A callback function invoked when the layout has occurred.
   *   No parameters are passed.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLayoutDidHappen(() => {
   *   console.log('Layout has happened');
   *   // Perform post-layout actions
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnLayoutDidHappen(listener: () => void): Listener {
    return this.eventListener("mLayoutDidHappen", listener);
  }

  /**
   * Adds a listener for the text show toggled event.
   * This method allows you to subscribe to the `mTextShowToggled` event,
   * which is triggered when text visibility is toggled, indicating success.
   *
   * @param listener - A callback function invoked when text show is toggled.
   *   Receives a boolean indicating whether the toggle was successful.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnTextShowToggled((success) => {
   *   console.log('Text show toggled:', success ? 'success' : 'failed');
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnTextShowToggled(listener: (success: boolean) => void): Listener {
    return this.eventListener("mTextShowToggled", listener);
  }

  /**
   * Adds a listener for the MAE mistake hidden event.
   * This method allows you to subscribe to the `mMaeMistakeHidden` event,
   * which is triggered when a mistake (possibly MAE-related) is hidden.
   *
   * @param listener - A callback function invoked when the mistake is hidden.
   *   No parameters are passed.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMaeMistakeHidden(() => {
   *   console.log('MAE mistake has been hidden');
   *   // Update UI or state
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnMaeMistakeHidden(listener: () => void): Listener {
    return this.eventListener("mMaeMistakeHidden", listener);
  }

  /**
   * Adds a listener for the layout will happen event.
   * This method allows you to subscribe to the `mLayoutWillHappen` event,
   * which is triggered before a layout operation begins.
   *
   * @param listener - A callback function invoked when a layout is about to happen.
   *   No parameters are passed.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLayoutWillHappen(() => {
   *   console.log('Layout is about to happen');
   *   // Prepare for layout changes
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnLayoutWillHappen(listener: () => void): Listener {
    return this.eventListener("mLayoutWillHappen", listener);
  }

  /**
   * Adds a listener for the playing notes info event.
   * This method allows you to subscribe to the `mPlayingNotesInfo` event,
   * which is triggered with information about playing notes, including measure index and data.
   *
   * @param listener - A callback function invoked with playing notes info.
   *   Receives an object with `measureIndex` (number) and `data` (array of numbers, e.g., note values).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPlayingNotesInfo((data) => {
   *   console.log('Playing notes at measure', data.measureIndex, ':', data.data);
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnPlayingNotesInfo(
    listener: (data: { measureIndex: number; data: number[] }) => void,
  ): Listener {
    return this.eventListener("mPlayingNotesInfo", listener);
  }

  /**
   * Adds a listener for the cursor position set event.
   * This method allows you to subscribe to the `mCursorPositionSet` event,
   * which is triggered when the cursor position is set.
   *
   * @param listener - A callback function invoked when cursor position is set.
   *   Receives an object with `success: boolean` (whether the position was set) and
   *   `second: float` (the actual playback second; 0 when `success` is false).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnCursorPositionSet(({ success, second }) => {
   *   console.log('Cursor position set:', success, 'at second', second);
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnCursorPositionSet(
    listener: (data: { success: boolean; second: number }) => void,
  ): Listener {
    return this.eventListener("mCursorPositionSet", listener);
  }

  /**
   * Adds a listener for the loop region changed event.
   * This method allows you to subscribe to the `mLoopRegionChanged` event,
   * which is triggered when the loop region changes, providing coordinates and sizes.
   *
   * @param listener - A callback function invoked when the loop region changes.
   *   Receives an object with `startX`, `startY`, `endX`, `endY` (numbers for coordinates) and `sizeMouse`, `sizeTouch` (numbers for sizes).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoopRegionChanged((data) => {
   *   console.log('Loop region changed:', data);
   *   // Update loop visualization
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnLoopRegionChanged(
    listener: (data: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      sizeMouse: number;
      sizeTouch: number;
    }) => void,
  ): Listener {
    return this.eventListener("mLoopRegionChanged", listener);
  }

  /**
   * Adds a listener for the size scroll changed event.
   * This method allows you to subscribe to the `mSizeScrollChanged` event,
   * which is triggered when the scroll size changes, providing scroll data.
   *
   * @param listener - A callback function invoked when scroll size changes.
   *   Receives data of type `TOnScroll` (e.g., scroll position or size details).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnSizeScrollChanged((data) => {
   *   console.log('Size scroll changed:', data);
   *   // Adjust UI based on scroll data
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnSizeScrollChanged(
    listener: (data: TOnScroll) => void,
  ): Listener {
    return this.eventListener("mSizeScrollChanged", listener);
  }

  /**
   * Adds a listener for the canvas size changed event.
   * This method allows you to subscribe to the `mCanvasSizeChanged` event,
   * which is triggered when the canvas size changes, providing new dimensions.
   *
   * @param listener - A callback function invoked when canvas size changes.
   *   Receives an object with `width` and `height` (numbers for new dimensions).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnCanvasSizeChanged((data) => {
   *   console.log('Canvas size changed to:', data.width, 'x', data.height);
   *   // Resize dependent elements
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnCanvasSizeChanged(
    listener: (data: { width: number; height: number }) => void,
  ): Listener {
    return this.eventListener("mCanvasSizeChanged", listener);
  }

  /**
   * Adds a listener for the page breaks toggled event.
   * This method allows you to subscribe to the `mPageBreaksToggled` event,
   * which is triggered when page breaks are toggled, indicating success.
   *
   * @param listener - A callback function invoked when page breaks are toggled.
   *   Receives a boolean indicating whether the toggle was successful.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPageBreaksToggled((success) => {
   *   console.log('Page breaks toggled:', success ? 'success' : 'failed');
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   */
  addListenerOnPageBreaksToggled(
    listener: (success: boolean) => void,
  ): Listener {
    return this.eventListener("mPageBreaksToggled", listener);
  }

  /**
   * Adds a listener for the MAE assessment done event.
   * This method allows you to subscribe to the `mMaeAssessmentDone` event,
   * which is triggered when a MAE (Music Assessment Engine) assessment is completed,
   * providing results, recording path, and result JSON path.
   *
   * @param listener - A callback function invoked when the assessment is done.
   *   Receives an object with `results` (containing optional `Accuracy` and `Rhythm` scores),
   *   `recordingPath` (string path to the recording), and `resultJSONPath` (string path to JSON results).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMaeAssessmentDone((data) => {
   *   console.log('Assessment results:', data.results);
   *   console.log('Recording path:', data.recordingPath);
   *   // Process the results
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnMaeAssessmentDone(
    listener: (data: {
      results: {
        Accuracy?: number;
        Rhythm?: number;
      };
      recordingPath: string;
      resultJSONPath: string;
    }) => void,
  ): Listener {
    return this.eventListener("mMaeAssessmentDone", listener);
  }

  /**
   * Adds a listener for the smart scroll mistake event.
   * This method allows you to subscribe to the `mSmartScrollMistake` event,
   * which is triggered when a mistake occurs during smart scrolling, providing chord ID and time.
   *
   * @param listener - A callback function invoked on a smart scroll mistake.
   *   Receives an object with `chordId` (number) and `timeMs` (number, time in milliseconds).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnSmartScrollMistake((data) => {
   *   console.log('Mistake at chord', data.chordId, 'at time', data.timeMs, 'ms');
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnSmartScrollMistake(
    listener: (data: { chordId: number; timeMs: number }) => void,
  ): Listener {
    return this.eventListener("mSmartScrollMistake", listener);
  }

  /**
   * Maximum font size available for notation.Called for any API call that changes the current notation scale. For example, zoom , etc.
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMaxNoteSizeChanged((maxNoteSize) => {
   *   console.log('Max note size changed to:', maxNoteSize);
   *   // Adjust rendering or UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnMaxNoteSizeChanged(
    listener: (maxNoteSize: number) => void,
  ): Listener {
    return this.eventListener("mMaxNoteSizeChanged", listener);
  }

  /**
   * Called when XTZ is initialized in memory and ready to call the API;
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnInitializeFinished((success) => {
   *   console.log('Initialization finished:', success ? 'success' : 'failed');
   *   // Proceed with app logic
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnInitializeFinished(
    listener: (success: boolean) => void,
  ): Listener {
    return this.eventListener("mInitializeFinished", listener);
  }

  /**
   * Adds a listener for the part visible changed event.
   * This method allows you to subscribe to the `mPartVisibleChanged` event,
   * which is triggered when the visibility of parts changes, providing the parts string.
   *
   * @param listener - A callback function invoked when part visibility changes.
   *   Receives a string representing the visible parts.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPartVisibleChanged((parts) => {
   *   console.log('Visible parts changed to:', parts);
   *   // Update UI visibility
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPartVisibleChanged(listener: (parts: string) => void): Listener {
    return this.eventListener("mPartVisibleChanged", listener);
  }

  /**
   * Adds a listener for the MAE calibration done event.
   * This method allows you to subscribe to the `mMaeCalibrationDone` event,
   * which is triggered when MAE calibration is completed, providing the latency.
   *
   * @param listener - A callback function invoked when calibration is done.
   *   Receives a number representing the latency in milliseconds.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMaeCalibrationDone((latency) => {
   *   console.log('Calibration done with latency:', latency, 'ms');
   *   // Adjust for latency
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnMaeCalibrationDone(
    listener: (latency: number) => void,
  ): Listener {
    return this.eventListener("mMaeCalibrationDone", listener);
  }

  /**
   * Adds a listener for the print MAE results done event.
   * This method allows you to subscribe to the `mPrintMaeResultsDone` event,
   * which is triggered when printing MAE results is completed, providing the paths.
   *
   * @param listener - A callback function invoked when printing results is done.
   *   Receives a string representing the paths to the printed results.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPrintMaeResultsDone((paths) => {
   *   console.log('Printed results paths:', paths);
   *   // Access or display the results
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPrintMaeResultsDone(
    listener: (paths: string) => void,
  ): Listener {
    return this.eventListener("mPrintMaeResultsDone", listener);
  }

  /**
   * Adds a listener for the sound font load failed event.
   * This method allows you to subscribe to the `mSoundFontLoadFailed` event,
   * which is triggered when loading a sound font fails.
   *
   * @param listener - A callback function invoked when sound font loading fails.
   *   No parameters are passed.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnSoundFontLoadFailed(() => {
   *   console.log('Sound font load failed');
   *   // Handle error, e.g., show alert
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnSoundFontLoadFailed(listener: () => void): Listener {
    return this.eventListener("mSoundFontLoadFailed", listener);
  }

  /**
   * Adds a listener for the part playable changed event.
   * This method allows you to subscribe to the `mPartPlayableChanged` event,
   * which is triggered when the playable status of parts changes, providing the parts string.
   *
   * @param listener - A callback function invoked when part playable status changes.
   *   Receives a string representing the playable parts.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPartPlayableChanged((parts) => {
   *   console.log('Playable parts changed to:', parts);
   *   // Update playback controls
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPartPlayableChanged(
    listener: (parts: string) => void,
  ): Listener {
    return this.eventListener("mPartPlayableChanged", listener);
  }

  /**
   * Adds a listener for the metronome info updated event.
   * This method allows you to subscribe to the `mMetronomeInfoUpdated` event,
   * which is triggered when metronome information is updated, providing enabled status, volume, and mode.
   *
   * @param listener - A callback function invoked when metronome info updates.
   *   Receives an object with `enabled` (boolean), `volume` (number), and `mode` (number).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMetronomeInfoUpdated((data) => {
   *   console.log('Metronome updated:', data);
   *   // Sync UI with metronome settings
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnMetronomeInfoUpdated(
    listener: (data: {
      enabled: boolean;
      volume: number;
      mode: number;
    }) => void,
  ): Listener {
    return this.eventListener("mMetronomeInfoUpdated", listener);
  }

  /**
   * Adds a listener for the part audio info updated event.
   * This method allows you to subscribe to the `mPartAudioInfoUpdated` event,
   * which is triggered when part audio information is updated, providing balance, volume, pitch, and track.
   *
   * @param listener - A callback function invoked when part audio info updates.
   *   Receives an object with `balance` (number), `volume` (number), `pitch` (number), and `track` (number).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPartAudioInfoUpdated((data) => {
   *   console.log('Part audio updated:', data);
   *   // Adjust audio settings in UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPartAudioInfoUpdated(
    listener: (data: {
      balance: number;
      volume: number;
      pitch: number;
      track: number;
    }) => void,
  ): Listener {
    return this.eventListener("mPartAudioInfoUpdated", listener);
  }

  /**
   * Adds a listener for the range selection enable event.
   * This method allows you to subscribe to the `mRangeSelectionEnable` event,
   * which is triggered when range selection is enabled or disabled.
   *
   * @param listener - A callback function invoked when range selection enable status changes.
   *   Receives a boolean indicating if range selection is enabled.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnRangeSelectionEnable((isEnabled) => {
   *   console.log('Range selection enabled:', isEnabled);
   *   // Update selection UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnRangeSelectionEnable(
    listener: (isEnabled: boolean) => void,
  ): Listener {
    return this.eventListener("mRangeSelectionEnable", listener);
  }

  /**
   * Adds a listener for the backing tracks switched event.
   * This method allows you to subscribe to the `mBackingTracksSwitched` event,
   * which is triggered when backing tracks are switched on or off.
   *
   * @param listener - A callback function invoked when backing tracks are switched.
   *   Receives a boolean indicating if backing tracks are enabled.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnBackingTracksSwitched((enabled) => {
   *   console.log('Backing tracks enabled:', enabled);
   *   // Update playback UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnBackingTracksSwitched(
    listener: (enabled: boolean) => void,
  ): Listener {
    return this.eventListener("mBackingTracksSwitched", listener);
  }

  /**
   * Adds a listener for the track audio info updated event.
   * This method allows you to subscribe to the `mTrackAudioInfoUpdated` event,
   * which is triggered when track audio information is updated, providing balance, volume, track, and muted status.
   *
   * @param listener - A callback function invoked when track audio info updates.
   *   Receives an object with `balance` (number), `volume` (number), `track` (number), and `muted` (boolean).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnTrackAudioInfoUpdated((data) => {
   *   console.log('Track audio updated:', data);
   *   // Adjust track settings in UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnTrackAudioInfoUpdated(
    listener: (data: {
      balance: number;
      volume: number;
      track: number;
      muted: boolean;
    }) => void,
  ): Listener {
    return this.eventListener("mTrackAudioInfoUpdated", listener);
  }

  /**
   * Adds a listener for the playback status changed event.
   * This method allows you to subscribe to the `mPlaybackStatusChanged` event,
   * which is triggered when the playback status changes, providing the new status.
   *
   * @param listener - A callback function invoked when playback status changes.
   *   Receives a number representing the new playback status (e.g., 0 for stopped, 1 for playing).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPlaybackStatusChanged((status) => {
   *   console.log('Playback status changed to:', status);
   *   // Update play/pause buttons
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPlaybackStatusChanged(
    listener: (playbackStatusChanged: number) => void,
  ): Listener {
    return this.eventListener("mPlaybackStatusChanged", listener);
  }

  /**
   * Current second of XTZ playback
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPlaybackSecondResponse((second) => {
   *   console.log('Current playback second:', second);
   *   // Update progress bar
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPlaybackSecondResponse(
    listener: (playbackSecond: number) => void,
  ): Listener {
    return this.eventListener("mPlaybackSecondResponse", listener);
  }

  /**
   * Fired when playback jumps to the beginning of an enabled loop.
   * @event
   * @eventProperty
   * @returns callback for unsubscribing (removing the event from memory, e.g., via `unsubscribe?.()`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnLoopJump((targetSec) => {
   *   console.log('Loop jumped to second:', targetSec);
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnLoopJump(
    listener: (targetSec: number) => void,
  ): Listener {
    return this.eventListener("mLoopJump", listener);
  }

  /**
   * Adds a listener for the track visibility updated event.
   * This method allows you to subscribe to the `mTrackVisibilityUpdated` event,
   * which is triggered when track visibility changes, providing track and visibility status.
   *
   * @param listener - A callback function invoked when track visibility updates.
   *   Receives an object with `track` (number) and `visible` (boolean).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnTrackVisibilityUpdated((data) => {
   *   console.log('Track', data.track, 'visibility:', data.visible);
   *   // Show/hide track in UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnTrackVisibilityUpdated(
    listener: (data: { track: number; visible: boolean }) => void,
  ): Listener {
    return this.eventListener("mTrackVisibilityUpdated", listener);
  }

  /**
   * Adds a listener for the play instruments changed event.
   * This method allows you to subscribe to the `mPlayInstrumentsChanged` event,
   * which is triggered when the list of playable instruments changes.
   *
   * @param listener - A callback function invoked when playable instruments change.
   *   Receives an array of numbers representing the instrument IDs.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPlayInstrumentsChanged((instruments) => {
   *   console.log('Playable instruments changed to:', instruments);
   *   // Update instrument selection UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPlayInstrumentsChanged(
    listener: (instruments: number[]) => void,
  ): Listener {
    return this.eventListener("mPlayInstrumentsChanged", listener);
  }

  /**
   * Adds a listener for the playback position changed event.
   * This method allows you to subscribe to the `mPlaybackPositionChanged` event,
   * which is triggered when the playback position changes, providing detailed position info.
   *
   * @param listener - A callback function invoked when playback position changes.
   *   Receives an object with `playbackSecond` (number), `pageIndex` (number), `measureIndex` (number),
   *   `eventIndex` (number), and `staffNumber` (boolean).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnPlaybackPositionChanged((data) => {
   *   console.log('Playback position:', data);
   *   // Highlight current position in score
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnPlaybackPositionChanged(
    listener: (data: {
      playbackSecond: number;
      playbackPositionX: number;
      pageIndex: number;
      measureIndex: number;
      eventIndex: number;
      staffNumber: boolean;
    }) => void,
  ): Listener {
    return this.eventListener("mPlaybackPositionChanged", listener);
  }

  /**
   * Adds a listener for the general audio info updated event.
   * This method allows you to subscribe to the `mGeneralAudioInfoUpdated` event,
   * which is triggered when general audio information is updated, providing balance, volume, and muted status.
   *
   * @param listener - A callback function invoked when general audio info updates.
   *   Receives an object with `balance` (number), `volume` (number), and `muted` (boolean).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnGeneralAudioInfoUpdated((data) => {
   *   console.log('General audio updated:', data);
   *   // Adjust global audio settings in UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnGeneralAudioInfoUpdated(
    listener: (data: {
      balance: number;
      volume: number;
      muted: boolean;
    }) => void,
  ): Listener {
    return this.eventListener("mGeneralAudioInfoUpdated", listener);
  }

  /**
   * Adds a listener for the smart scroll recording done event.
   * This method allows you to subscribe to the `mSmartScrollRecordingDone` event,
   * which is triggered when smart scroll recording is completed, providing the path and duration.
   *
   * @param listener - A callback function invoked when smart scroll recording is done.
   *   Receives an object with `path` (string) and `durationMs` (number, duration in milliseconds).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnSmartScrollRecordingDone((data) => {
   *   console.log('Recording done at:', data.path, 'duration:', data.durationMs, 'ms');
   *   // Process or play the recording
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnSmartScrollRecordingDone(
    listener: (data: { path: string; durationMs: number }) => void,
  ): Listener {
    return this.eventListener("mSmartScrollRecordingDone", listener);
  }

  /**
   * Adds a listener for the smart scroll chords changed event.
   * This method allows you to subscribe to the `mSmartScrollChordsChanged` event,
   * which is triggered when smart scroll chords change, providing chord ID and time.
   *
   * @param listener - A callback function invoked when smart scroll chords change.
   *   Receives an object with `chordId` (number) and `timeMs` (number, time in milliseconds).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnSmartScrollChordsChanged((data) => {
   *   console.log('Chord changed:', data.chordId, 'at time:', data.timeMs, 'ms');
   *   // Update chord display
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnSmartScrollChordsChanged(
    listener: (data: { chordId: number; timeMs: number }) => void,
  ): Listener {
    return this.eventListener("mSmartScrollChordsChanged", listener);
  }

  /**
   * Adds a listener for the smart scroll soundcheck result event.
   * This method allows you to subscribe to the `mSmartScrollSoundcheckResult` event,
   * which is triggered with the result of a smart scroll soundcheck, indicating if it was correct.
   *
   * @param listener - A callback function invoked with the soundcheck result.
   *   Receives a boolean indicating if the soundcheck was correct.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnSmartScrollSoundcheckResult((isCorrect) => {
   *   console.log('Soundcheck result:', isCorrect ? 'correct' : 'incorrect');
   *   // Provide feedback to user
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnSmartScrollSoundcheckResult(
    listener: (isCorrect: boolean) => void,
  ): Listener {
    return this.eventListener("mSmartScrollSoundcheckResult", listener);
  }

  /**
   * Adds a listener for the range selection region changed event.
   * This method allows you to subscribe to the `mRangeSelectionRegionChanged` event,
   * which is triggered when the range selection region changes, providing start and end indices and seconds.
   *
   * @param listener - A callback function invoked when range selection region changes.
   *   Receives an object with `startMeasureIdx` (number), `endMeasureIdx` (number),
   *   `startSec` (number), and `endSec` (number).
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnRangeSelectionRegionChanged((data) => {
   *   console.log('Range selection changed:', data);
   *   // Highlight the selected range in UI
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnRangeSelectionRegionChanged(
    listener: (data: {
      startMeasureIdx: number;
      endMeasureIdx: number;
      startSec: number;
      endSec: number;
    }) => void,
  ): Listener {
    return this.eventListener("mRangeSelectionRegionChanged", listener);
  }

  /**
   * Adds a listener for the metronome click event.
   * This method allows you to subscribe to the `mMetronomeClick` event,
   * which is triggered on each metronome click.
   *
   * @param listener - A callback function invoked on each metronome click.
   *   No parameters are passed.
   * @returns A Listener object that can be used to remove the subscription (e.g., via `removeListener`).
   *
   * @example
   * ```typescript
   * const unsubscribe = addListenerOnMetronomeClick(() => {
   *   console.log('Metronome clicked');
   *   // Trigger visual feedback or sound
   * });
   * // Later: unsubscribe?.(); // Remove the listener
   * ```
   *
   */
  addListenerOnMetronomeClick(listener: () => void): Listener {
    return this.eventListener("mMetronomeClick", listener);
  }

  setPageBreaks(enabled: boolean): void {
    this.logger.event(`call func setPageBreaks with enabled ${enabled}`);
    return this.nativeInstance.setPageBreaks(enabled);
  }

  togglePageBreaks(enabled: boolean): void {
    return this.setPageBreaks(enabled);
  }

  setTitleVisible(enabled: boolean): void {
    this.logger.event(`call func setTitleVisible with enabled ${enabled}`);
    return this.nativeInstance.setTitleVisible(enabled);
  }

  setTrack(trackIndex: number): void {
    this.logger.event(`call func setTrack with trackIndex ${trackIndex}`);
    return this.nativeInstance.setTrack(trackIndex);
  }

  selectTrack(trackIndex: number): void {
    return this.setTrack(trackIndex);
  }

  setFitMode(mode: number): void {
    this.logger.event(`call func setFitMode with mode ${mode}`);
    return this.nativeInstance.setFitMode(mode);
  }

  setPageWidthScale(scale: number): void {
    this.logger.event(`call func setPageWidthScale with scale ${scale}`);
    return this.nativeInstance.setPageWidthScale(scale);
  }

  setAutoscrollEnabled(isAutoPageFlipEnabled: boolean, isAutoPageScrollEnabled: boolean): void {
    this.logger.event(`call func setAutoscrollEnabled with isAutoPageFlipEnabled ${isAutoPageFlipEnabled}, isAutoPageScrollEnabled ${isAutoPageScrollEnabled}`);
    return this.nativeInstance.setAutoscrollEnabled(isAutoPageFlipEnabled, isAutoPageScrollEnabled);
  }

  setGeneralVolume(volume: number): void {
    this.logger.event(`call func setGeneralVolume with volume ${volume}`);
    return this.nativeInstance.setGeneralVolume(volume);
  }

  setGeneralBalance(balance: number): void {
    this.logger.event(`call func setGeneralBalance with balance ${balance}`);
    return this.nativeInstance.setGeneralBalance(balance);
  }

  setGeneralMuted(isMuted: boolean): void {
    this.logger.event(`call func setGeneralMuted with isMuted ${isMuted}`);
    return this.nativeInstance.setGeneralMuted(isMuted);
  }

  setPartBalance(part: number, balance: number): void {
    this.logger.event(`call func setPartBalance with part ${part}, balance ${balance}`);
    return this.nativeInstance.setPartBalance(part, balance);
  }

  setPartPitch(part: number, pitch: number): void {
    this.logger.event(`call func setPartPitch with part ${part}, pitch ${pitch}`);
    return this.nativeInstance.setPartPitch(part, pitch);
  }

  setAudioTrackVolume(track: number, volume: number): void {
    this.logger.event(`call func setAudioTrackVolume with track ${track}, volume ${volume}`);
    return this.nativeInstance.setAudioTrackVolume(track, volume);
  }

  setAudioTrackBalance(track: number, balance: number): void {
    this.logger.event(`call func setAudioTrackBalance with track ${track}, balance ${balance}`);
    return this.nativeInstance.setAudioTrackBalance(track, balance);
  }

  setAudioTrackPitch(track: number, pitch: number): void {
    this.logger.event(`call func setAudioTrackPitch with track ${track}, pitch ${pitch}`);
    return this.nativeInstance.setAudioTrackPitch(track, pitch);
  }

  setMetronomeMode(mode: number): void {
    this.logger.event(`call func setMetronomeMode with mode ${mode}`);
    return this.nativeInstance.setMetronomeMode(mode);
  }

  setMetronomeEnabledBinary(enabled: boolean): void {
    this.logger.event(`call func setMetronomeEnabledBinary with enabled ${enabled}`);
    return this.nativeInstance.setMetronomeEnabledBinary(enabled);
  }

  requestPlaybackSecond(): void {
    this.logger.event(`call func requestPlaybackSecond`);
    return this.nativeInstance.requestPlaybackSecond();
  }

  eventZoom(x: number, y: number, delta: number): void {
    this.logger.event(`call func eventZoom with x ${x}, y ${y}, delta ${delta}`);
    return this.nativeInstance.eventZoom(x, y, delta);
  }

  eventZoomEnd(): void {
    this.logger.event(`call func eventZoomEnd`);
    return this.nativeInstance.eventZoomEnd();
  }

  eventZoomStart(x: number, y: number): void {
    this.logger.event(`call func eventZoomStart with x ${x}, y ${y}`);
    return this.nativeInstance.eventZoomStart(x, y);
  }

  setMaeOnsetTolerance(onset: number): void {
    this.logger.event(`call func setMaeOnsetTolerance with onset ${onset}`);
    return this.nativeInstance.setMaeTolerance(onset);
  }

  setMaeAnalysisMode(mode: number): void {
    this.logger.event(`call func setMaeAnalysisMode with mode ${mode}`);
    return this.nativeInstance.setMaeAnalysisMode(mode);
  }

  setMaeVoiceIds(idsJson: string): void {
    this.logger.event(`call func setMaeVoiceIds with idsJson ${idsJson}`);
    return this.nativeInstance.setMaeVoiceIds(idsJson);
  }

  setMaeHandleRepeats(enable: boolean): void {
    this.logger.event(`call func setMaeHandleRepeats with enable ${enable}`);
    return this.nativeInstance.setMaeHandleRepeats(enable);
  }
}

export const xtz = new XTZ();
