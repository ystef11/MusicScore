import { useNavigation, useRoute } from '@react-navigation/native'

export const withNavigation = (Component: any) => {
    return function (props: any) {
        const navigation = useNavigation()
        const route = useRoute()
        return <Component navigation={navigation} route={route} {...props} />
    }
}
