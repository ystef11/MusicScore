import { Dispatch } from 'react'

import { authThunks } from '@mu-native/auth'
import { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'
import { presentAlert, presentBottomSheetAlert } from '@mu-native/ds'
import { authorization } from '@mu-native/icons/authorization'
import { detail } from '@mu-native/icons/detail'
import { trashBin } from '@mu-native/icons/trashBin'
import { translate, localizeSorting } from '@mu-native/locale'
import { profileThunks } from '@mu-native/profile'
import { appEventsEmitter, systemThunks } from '@mu-native/system'
import { TUserProfileDynamicStoreChunk, userProfileInfoThunks } from '@mu-native/user-profile-info'
import { Action } from 'redux'

import MetricaEvents from '../constants/MetricaEvents'
import { deleteComment } from '../Courses/coursesActionsAsync'
import type { UserInfoT } from '../profileScreens/users/userTypes'
import reportEvent from '../Utils/Analytics'
import { TSortKind, TSortKindEnum, TSortOrder, TSortParams } from '../Utils/Sort'

async function showProfileMoreSettingsActionSheet(dispatch: Dispatch<Action>) {
    const id = await presentBottomSheetAlert({
        cancelable: true,
        buttons: [
            {
                rawText: translate('native.screen_profile.delete_account'),
                style: 'destructive',
                id: 'delete',
                icon: trashBin,
            },
        ],
    })
    if (id === 'delete') {
        reportEvent(MetricaEvents.PROFILE_DELETE_ACCOUNT_CLICK)
        // @ts-ignore
        systemThunks.showConfirmDeleteAccount(() => dispatch(profileThunks?.remove()))
    }
}

export default {
    showScoreSortPopup(
        currentSort: TSortParams,
        sortScoresFunction: (kind: TSortKind, order: TSortOrder) => void,
        sortKinds: any[] = [
            TSortKindEnum.TITLE,
            TSortKindEnum.DATE_ADDED,
            TSortKindEnum.DATE_UPDATED,
            TSortKindEnum.DATE_CREATED,
        ],
    ) {
        return () => {
            const { order: sortOrder, kind: sortKind } = currentSort
            const sortTypes = sortKinds.reduce((acc, current) => {
                acc.push({ kind: current, order: 'asc' })
                acc.push({ kind: current, order: 'desc' })
                return acc
            }, [] as TSortParams[])

            const buttons: { text: string; selected: boolean; onPress: () => void }[] =
                sortTypes.map(({ kind, order }: { kind: any; order: any }) => {
                    const sortType = `${kind}_${order}`
                    const text = localizeSorting(sortType)
                    const selected = `${sortKind}_${sortOrder}` === sortType
                    const onPress = () => {
                        sortScoresFunction(kind, order)
                    }
                    return { text, selected, onPress }
                })
            appEventsEmitter.emit('presentListItemsSheet', buttons)
        }
    },

    showCourseCommentActionPopup(commentId: number, chunk: TCourseDetailsDynamicStoreChunk) {
        return async (dispatch: any) => {
            const id = await presentBottomSheetAlert({
                cancelable: true,
                buttons: [
                    {
                        rawText: translate('native.screen_comments.remove'),
                        id: 'remove',
                        icon: trashBin,
                        style: 'destructive',
                    },
                ],
            })

            if (id === 'remove') {
                dispatch(deleteComment(chunk, commentId))
            }
        }
    },

    showUserProfileActionSheet(
        userProfile: UserInfoT | null,
        chunk?: TUserProfileDynamicStoreChunk,
    ) {
        return async (dispatch: any) => {
            const id = await presentAlert({
                rawTitle: userProfile?.userName ?? translate('native.user.unfollow_confirm_title'),
                cancelable: true,
                buttons: [
                    {
                        rawText: translate('native.user.unfollow'),
                        style: 'destructive',
                        id: 'delete',
                    },
                ],
            })
            if (id === 'delete') {
                await dispatch(userProfileInfoThunks.toggleFollowUser(userProfile, chunk))
            }
        }
    },

    showProfileSettingsActionSheet() {
        return async (dispatch: any) => {
            reportEvent(MetricaEvents.PROFILE_MORE_OPEN)

            const id = await presentBottomSheetAlert({
                cancelable: true,
                buttons: [
                    {
                        rawText: translate('native.settings_screen.logout_button'),
                        id: 'logout',
                        icon: authorization,
                        style: 'default',
                    },
                    {
                        rawText: translate('native.score_action_sheet.more'),
                        id: 'more',
                        icon: detail,
                        style: 'default',
                    },
                ],
            })
            if (id === 'logout') {
                reportEvent(MetricaEvents.LOGOUT)
                dispatch(authThunks.logout())
                return
            }

            if (id === 'more') {
                showProfileMoreSettingsActionSheet(dispatch)
            }
        }
    },
}
