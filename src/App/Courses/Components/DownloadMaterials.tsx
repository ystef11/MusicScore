import { useEffect } from 'react'
import {
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'

import { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'
import { icons, BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import { COLOR_BLUE_600, COLOR_GREY_900, COLOR_LINK, COLOR_WHITE } from '../../constants/styles'
import reportEvent from '../../Utils/Analytics'
import { loadCourseAdditionalContent, loadCourseAllAdditionalContent } from '../coursesActionsAsync'
import type { TMaterial } from '../coursesTypes'

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    } as ViewStyle,
    title: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '600',
        color: COLOR_GREY_900,
    } as TextStyle,
    lessonName: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        color: COLOR_GREY_900,
        marginTop: 8,
        marginBottom: 20,
    } as TextStyle,
    materialContainer: {
        flexDirection: 'row',
        marginVertical: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    materialTitle: {
        width: '70%',
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: COLOR_GREY_900,
    } as TextStyle,
    button: {
        width: '100%',
        height: 40,
        borderRadius: 4,
        backgroundColor: COLOR_LINK,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    buttonTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: COLOR_WHITE,
    } as TextStyle,
    iconDownload: {
        width: 24,
        height: 24,
        tintColor: COLOR_BLUE_600,
    } as ImageStyle,
})

type TProps = {
    lessonName: string
    materials: TMaterial[]
    courseDetailsChunk: TCourseDetailsDynamicStoreChunk
}

const DownloadMaterials = ({ lessonName, materials, courseDetailsChunk }: TProps) => {
    const [isMaterialsLoading, loadingIndex, courseInfo] = useValues([
        courseDetailsChunk.props.getIsMaterialsLoading,
        courseDetailsChunk.props.getLoadingMaterialIndex,
        courseDetailsChunk.props.getCourseInfo,
    ])
    const actions = useActions({
        loadCourseAdditionalContent,
        loadCourseAllAdditionalContent,
    })

    useEffect(() => {
        if (courseInfo) {
            reportEvent(MetricaEvents.LESSON_MATERIALS_DOWNLOAD_SHOW, { ...courseInfo.tracking })
        }
    }, [])
    const handleLoadCourseAdditionalContent = (material: TMaterial, index: number) => {
        if (courseInfo) {
            reportEvent(MetricaEvents.LESSON_MATERIALS_DOWNLOAD_SHOW, { ...courseInfo.tracking })
        }
        actions.loadCourseAdditionalContent(courseDetailsChunk, material, index)
    }
    const handleLoadCourseAllAdditionalContent = () => {
        if (courseInfo) {
            reportEvent(MetricaEvents.LESSON_MATERIALS_DOWNLOAD_SHOW, { ...courseInfo.tracking })
        }

        reportEvent(MetricaEvents.COURSE_MATERIAL_DOWNLOAD_CLICK)
        actions.loadCourseAllAdditionalContent(courseDetailsChunk, materials)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate('native.courses.materials')}</Text>
            <Text style={styles.lessonName}>{lessonName}</Text>
            {materials?.map((material: TMaterial, index: number) => (
                <View key={material.id} style={styles.materialContainer}>
                    <Text style={styles.materialTitle}>{material.name}</Text>
                    {loadingIndex === index ? (
                        <BrandAppLoader />
                    ) : (
                        <TouchableOpacity
                            onPress={() => handleLoadCourseAdditionalContent(material, index)}
                            disabled={isMaterialsLoading}
                        >
                            <Image style={styles.iconDownload} source={icons.downLoadMd} />
                        </TouchableOpacity>
                    )}
                </View>
            ))}
            <TouchableOpacity
                style={styles.button}
                onPress={handleLoadCourseAllAdditionalContent}
                disabled={isMaterialsLoading}
            >
                <Text style={styles.buttonTitle}>
                    {translate(
                        materials?.length > 1
                            ? 'native.courses.download_materials'
                            : 'native.courses.download_material',
                        { number: materials?.length.toString() },
                    )}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default DownloadMaterials
