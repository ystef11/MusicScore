import { StyleSheet } from 'react-native'

import { AppText } from '../components/AppText/AppText'

type TProps = {
    title: string
}

export const FiltersSectionTitle = (props: TProps) => {
    return <AppText rawText={props.title} font="f17w600" style={styles.title} />
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 16,
    },
})
