import { StyleSheet } from 'react-native'

import { colors, style } from '@mu-native/ds'

const AVATAR_SIZE = 48
export const styles = StyleSheet.create({
    container: style.view({
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginVertical: 12,
        backgroundColor: colors.white,
    }),
    avatar: style.image({
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    }),
    contentContainer: style.view({
        flex: 1,
        marginLeft: 16,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.gray100,
    }),
    title: style.text({
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 20,
        color: colors.text900,
        marginRight: 4,
    }),
    time: style.text({
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray500,
    }),
    message: style.text({
        paddingTop: 4,
        fontSize: 14,
        lineHeight: 20,
        color: colors.text900,
        marginRight: 2,
    }),
    buttonText: style.text({
        color: colors.gray500,
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 8,
    }),
    icon: style.image({
        width: 18,
        height: 14,
        tintColor: colors.gray500,
    }),
    marginLeft: style.view({
        marginLeft: 32,
    }),
    headingContainer: style.view({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }),
    headingBlock: style.view({
        flexDirection: 'row',
        alignItems: 'center',
    }),
    mention: style.text({
        color: colors.link,
    }),
    buttonsContainer: style.view({
        flexDirection: 'row',
        paddingTop: 12,
    }),
    button: style.view({
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    }),
})
