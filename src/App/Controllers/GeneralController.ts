import { generalModule } from '@mu-native/common'

import GeneralEvents from '../Model/GeneralEvents'

const promiseResolvers = new Map()
promiseResolvers.set(GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER, [])
export default {
    handleResponse(type: any, data: any) {
        switch (type) {
            case GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER: {
                const resolvers = promiseResolvers.get(
                    GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER,
                )
                const { filePath } = data
                resolvers.forEach((resolve: (path: string) => void) => resolve(filePath))
                promiseResolvers.set(GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER, [])
                break
            }

            default:
                break
        }
    },

    openFileManager(path: string) {
        return new Promise(resolve => {
            const resolvers = promiseResolvers.get(GeneralEvents.GET_FILE_PATH_FROM_FILE_MANAGER)
            resolvers.push(resolve)

            if (resolvers?.length === 1) {
                generalModule.openFileManager(path)
            }
        })
    },
}
