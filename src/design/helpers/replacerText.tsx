import React from 'react'
import { StyleSheet, Text } from 'react-native'

// @ts-ignore
import parse from '@bbob/parser'
import { platform } from '@mu-native/common'

import { colors } from '../constants/colors'
import { design } from '../constants/design'

import { layoutHelpers } from './layout'

const styles = StyleSheet.create({
    boldText: {
        fontWeight: 'bold',
    },
    blueText: {
        color: colors.blue500,
    },
    semiBoldText: {
        fontWeight: '600',
    },
    linkText: {
        textDecorationLine: 'underline',
    },
    throwLine: {
        textDecorationLine: 'line-through',
    },
    days: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(24),
        color: colors.blue600,
        fontWeight: 'bold',
    },
    displayFont: {
        fontFamily: design.fontFamilyMuseSymphony,
    },
})

type TReplaceText = {
    text: string
    onPress?: () => void | null
    customNumber?: number
    textColor?: string
    LinkComponent?: (props: any) => React.JSX.Element
    linkProps?: Record<string, unknown>
}

export const replacerText = ({
    text,
    onPress = () => null,
    customNumber,
    textColor = colors.text900,
    LinkComponent,
    linkProps = {},
}: TReplaceText) => {
    const ast = parse(text)
    const parsedText = ast?.map(
        (node: Record<string, string> | string, index: number): React.ReactNode | string => {
            if (!(typeof node === 'string')) {
                if (node.tag === 'color') {
                    return (
                        <Text key={`${index} - ${node.content}`} style={{ color: textColor }}>
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'mSymphony') {
                    return (
                        <Text key={`${index} - ${node.content}`} style={styles.displayFont}>
                            {node.content}
                        </Text>
                    )
                }
                if (node.tag === 'b') {
                    return (
                        <Text key={`${index} - ${node.content}`} style={styles.boldText}>
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'bl') {
                    return (
                        <Text key={`${index} - ${node.content}`} style={styles.blueText}>
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'sb') {
                    return (
                        <Text
                            key={`${index} - ${node.content}`}
                            style={platform.isAndroid ? styles.boldText : styles.semiBoldText}
                        >
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'a') {
                    return (
                        <Text
                            key={`${index} - ${node.content}`}
                            style={styles.linkText}
                            onPress={onPress}
                        >
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'l') {
                    return (
                        <Text
                            key={`${index} - ${node.content}`}
                            disabled
                            style={styles.throwLine}
                            onPress={onPress}
                        >
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'minutes') {
                    return customNumber || node.content
                }

                if (node.tag === 'd') {
                    return (
                        <Text key={node.content} style={styles.days}>
                            {node.content}
                        </Text>
                    )
                }

                if (node.tag === 'link') {
                    return (
                        // @ts-ignore
                        <LinkComponent
                            // @ts-ignore
                            url={node?.attrs?.url}
                            key={`${index} - ${node.content}`}
                            {...linkProps}
                        >
                            {node.content}
                        </LinkComponent>
                    )
                }

                return node.content
            }

            return node
        },
    )
    return parsedText
}
