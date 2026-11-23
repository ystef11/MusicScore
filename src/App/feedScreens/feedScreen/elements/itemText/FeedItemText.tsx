import { Text } from 'react-native'

import { styles } from './styles'

type Props = {
    text: string
}

const FeedItemText = ({ text }: Props) => {
    const { textStyle } = styles
    return <Text style={textStyle}>{text}</Text>
}

export default FeedItemText
