import { NativeEventEmitter, NativeModules } from 'react-native'

import GeneralController from '../Controllers/GeneralController'
import GeneralEvents from '../Model/GeneralEvents'

const { GeneralModule } = NativeModules
const generalEventEmitter = new NativeEventEmitter(GeneralModule)
generalEventEmitter.addListener(GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER, data => {
    GeneralController.handleResponse(GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER, data)
})
export default {}
