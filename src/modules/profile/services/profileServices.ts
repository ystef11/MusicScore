import { apiRequest, userContracts } from '@mu-native/api'

const deleteProfile = (): Promise<unknown> => apiRequest(userContracts.deleteMe)

export const profileServices = { deleteProfile }
