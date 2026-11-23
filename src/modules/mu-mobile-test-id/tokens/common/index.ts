// Design-system Switch exposes its state on the thumb so E2E can assert on/off.
const switchState = (testID: string, isOn: boolean) => `${testID}-${isOn ? 'on' : 'off'}`

export const commonTestIds = {
    switchState,
}
