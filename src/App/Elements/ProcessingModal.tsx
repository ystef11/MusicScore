import { ProgressCircle } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { offlineScoresStoreChunk } from '@mu-native/offlineScores'
import { useValues } from '@ug/store'

import Modal from '../Components/Modal/Modal'
import { COLOR_WHITE } from '../constants/styles'

const textStyle = {
    textAlign: 'center',
} as const

const ProcessingModal = () => {
    const [state] = useValues([offlineScoresStoreChunk.props.getFileProcessingState])
    const { progress, status } = state

    const text = status
        ? {
              start: translate('native.locale_file_status.start'),
              copy: translate('native.locale_file_status.copy'),
              load_fonts: translate('native.locale_file_status.font_loading'),
              open: translate('native.locale_file_status.open'),
          }[status]
        : null

    return (
        <Modal>
            <ProgressCircle
                formatText={() => text}
                progress={progress}
                textStyle={textStyle}
                color={COLOR_WHITE}
                size={180}
                showsText
            />
        </Modal>
    )
}

export default ProcessingModal
