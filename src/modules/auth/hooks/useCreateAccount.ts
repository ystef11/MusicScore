import { useActions } from '@ug/store'
import { authThunks } from '../store/authThunks'
import { AuthConsent, authStoreChunk } from '../store/authStoreChunk'

export type TCreateAccountParams =
    | {
          type: 'social'
          social: 'google' | 'facebook' | 'apple'
          token: string
      }
    | { type: 'email'; email: string; password: string; username: string }

export function useCreateAccount() {
    const actions = useActions({
        createAccount: authThunks.createAccount,
        setLoading: authStoreChunk.actions.setIsLoginLoading,
        appleLogin: authThunks.appleLogin,
        googleLogin: authThunks.googleLogin,
        facebookLogin: authThunks.facebookLogin,
    })

    const onCreateAccountPress = (params: TCreateAccountParams, consent?: AuthConsent) => {
        actions.setLoading(true)

        if (params.type === 'social') {
            // eslint-disable-next-line default-case
            switch (params.social) {
                case 'apple':
                    actions.appleLogin({ token: params.token, consent, shouldCloseStack: true })
                    break
                case 'facebook':
                    actions.facebookLogin({ token: params.token, consent, shouldCloseStack: true })
                    break
                case 'google':
                    actions.googleLogin({ token: params.token, consent, shouldCloseStack: true })
                    break
            }
            return
        }

        actions.createAccount({
            type: 'create',
            consent,
            email: params.email,
            login: params.username,
            password: params.password,
            shouldCloseStack: true,
        })
    }
    return { onCreateAccountPress }
}
