import type { THubDto } from '@mu-native/api'

import type { HubIconKey } from '../../../../../App/constants/expHubsIcons'
import type { THub, THubKey } from '../types/hubTypes'

/**
 * Wire hub to app model. `title` is the server display name ("Piano"); `THubKey` lists only the
 * known ones and `getTranslateKey` lowercases it, so unknown hubs fall back to the raw title.
 */
export const toHub = (dto: THubDto, featured = false): THub => ({
    id: dto.id,
    alias: dto.alias,
    title: dto.title as THubKey,
    visible: dto.visible === 1,
    imageBase: dto.imageBase.replace(/^.+\//, '') as HubIconKey,
    featured,
    stat: dto.stat ?? undefined,
})
