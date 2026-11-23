export const convertAuthError = (error: string | number | null) => {
    if (error === '1' || error === '51' || error === '0' || error === '12') {
        return { error: 'email' }
    }

    if (!error) {
        return { error: null }
    }

    if (typeof error === 'string') {
        return { error }
    }

    return { error: 'login' }
}
