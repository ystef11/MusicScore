import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { colors, CommonTouchable, Icon } from '@mu-native/ds'
import { plus } from '@mu-native/icons/plus'
import { RT_EVENTS } from '@mu-native/rt-analytics'

import reportEvent from '../../Utils/Analytics'
import { openMsczFileManagerWithPermissions } from '../../Utils/FileManager'

const styles = StyleSheet.create({
    icon: {
        marginEnd: 8,
    },
})

const FileManagerButton = ({ openFileManager }: { openFileManager: () => void }) => (
    <CommonTouchable onPress={openFileManager}>
        <Icon source={plus} size={20} tint={colors.blue600} style={styles.icon} />
    </CommonTouchable>
)

const mapDispatchToProps = (dispatch: (...args: Array<any>) => any) => ({
    openFileManager: () => {
        reportEvent(RT_EVENTS.SONGBOOK_UPLOAD_CLICK, {
            'params.key': ['format'],
            'params.str_value': ['mcsz'],
            'params.value': [0],
        })
        dispatch(openMsczFileManagerWithPermissions())
    },
})

export default connect(null, mapDispatchToProps)(FileManagerButton)
