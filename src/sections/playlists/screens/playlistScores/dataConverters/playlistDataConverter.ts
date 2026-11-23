import { getColor, getImageType } from '../helpers/helpers.ts'
import { TPlaylist, TPlaylistAPIModel, TPlaylistCardProps } from '../types/playlistTypes.ts'

export const playlistCardPropsDataConverter = ({
    id,
    title,
    subtitle,
    ...playlist
}: TPlaylist): TPlaylistCardProps => ({
    id,
    title,
    subtitle,
    backgroundColor: playlist.color || getColor(playlist.paletteColorType) || null,
    imageUrl: playlist.imageType !== 0 && playlist.imageUrl ? playlist.imageUrl : undefined,
    imageType: getImageType(playlist.imageType),
    isWhite:
        playlist.imageType === 1 ||
        (playlist.imageType === 3 && playlist.textColorType === 'light'),
})

export const playlistDataConverter = (apiModel: TPlaylistAPIModel): TPlaylist => ({
    id: apiModel.id,
    title: apiModel.title,
    subtitle: apiModel.subtitle,
    isPublic: apiModel.public === 1,
    url: apiModel.url,
    description: apiModel.description,
    scoresCount: apiModel.scores_cnt,
    imageType: apiModel.image_type,
    imageUrl: apiModel.image_url ?? '',
    isFavorite: apiModel.is_favorite,
    dateCreated: apiModel.date_created,
    textColorType: apiModel.text_color_type === 0 ? 'light' : 'dark',
    color: apiModel.color,
    dateScoresUpdated: apiModel.date_scores_updated,
    isUserMusescoreTeam: apiModel.is_user_musescore_team,
    paletteColorType: apiModel.palette_color_type,
})
