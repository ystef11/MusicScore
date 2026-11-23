import { getCountry } from 'react-native-localize'
import { NativeModules } from 'react-native'

const { DeviceCountryModule } = NativeModules

function getCountryCode(): string {
    return DeviceCountryModule.countryCode
}

export { getCountry, getCountryCode }
