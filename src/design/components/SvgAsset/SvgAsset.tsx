/* eslint-disable */
import React, { forwardRef, memo } from 'react'
import {StyleProp, View, ViewInstance, ViewStyle} from 'react-native'
import Ic_genre_blues from './../../svg//genres/ic_genre_blues.svg'
import Ic_genre_classical from './../../svg//genres/ic_genre_classical.svg'
import Ic_genre_comedy from './../../svg//genres/ic_genre_comedy.svg'
import Ic_genre_country from './../../svg//genres/ic_genre_country.svg'
import Ic_genre_darkwave from './../../svg//genres/ic_genre_darkwave.svg'
import Ic_genre_disco from './../../svg//genres/ic_genre_disco.svg'
import Ic_genre_electronic from './../../svg//genres/ic_genre_electronic.svg'
import Ic_genre_experimental from './../../svg//genres/ic_genre_experimental.svg'
import Ic_genre_folk from './../../svg//genres/ic_genre_folk.svg'
import Ic_genre_hiphop from './../../svg//genres/ic_genre_hiphop.svg'
import Ic_genre_jazz from './../../svg//genres/ic_genre_jazz.svg'
import Ic_genre_metal from './../../svg//genres/ic_genre_metal.svg'
import Ic_genre_new_age from './../../svg//genres/ic_genre_new_age.svg'
import Ic_genre_pop from './../../svg//genres/ic_genre_pop.svg'
import Ic_genre_reggae from './../../svg//genres/ic_genre_reggae.svg'
import Ic_genre_religious from './../../svg//genres/ic_genre_religious.svg'
import Ic_genre_rnb from './../../svg//genres/ic_genre_rnb.svg'
import Ic_genre_rock from './../../svg//genres/ic_genre_rock.svg'
import Ic_genre_soundtrack from './../../svg//genres/ic_genre_soundtrack.svg'
import Ic_genre_world from './../../svg//genres/ic_genre_world.svg'
import Ic_gift from './../../svg//hubs/ic_gift.svg'
import Ic_hub_brass from './../../svg//hubs/ic_hub_brass.svg'
import Ic_hub_disney from './../../svg//hubs/ic_hub_disney.svg'
import Ic_hub_electronics from './../../svg//hubs/ic_hub_electronics.svg'
import Ic_hub_folk from './../../svg//hubs/ic_hub_folk.svg'
import Ic_hub_for_you from './../../svg//hubs/ic_hub_for_you.svg'
import Ic_hub_for_you_old from './../../svg//hubs/ic_hub_for_you_old.svg'
import Ic_hub_guitar from './../../svg//hubs/ic_hub_guitar.svg'
import Ic_hub_keyboard from './../../svg//hubs/ic_hub_keyboard.svg'
import Ic_hub_marching_percussion from './../../svg//hubs/ic_hub_marching_percussion.svg'
import Ic_hub_museclass from './../../svg//hubs/ic_hub_museclass.svg'
import Ic_hub_new_for_you from './../../svg//hubs/ic_hub_new_for_you.svg'
import Ic_hub_percussion from './../../svg//hubs/ic_hub_percussion.svg'
import Ic_hub_piano from './../../svg//hubs/ic_hub_piano.svg'
import Ic_hub_popular from './../../svg//hubs/ic_hub_popular.svg'
import Ic_hub_saxophone from './../../svg//hubs/ic_hub_saxophone.svg'
import Ic_hub_strings from './../../svg//hubs/ic_hub_strings.svg'
import Ic_hub_trumpet from './../../svg//hubs/ic_hub_trumpet.svg'
import Ic_hub_video_game_tv from './../../svg//hubs/ic_hub_video_game_tv.svg'
import Ic_hub_video_game_tv_2 from './../../svg//hubs/ic_hub_video_game_tv_2.svg'
import Ic_hub_voice from './../../svg//hubs/ic_hub_voice.svg'
import Ic_hub_woodwings from './../../svg//hubs/ic_hub_woodwings.svg'
import Ic_gift_hub from './../../svg//ic_gift_hub.svg'
import Ic_hub_new from './../../svg//ic_hub_new.svg'
import Ic_hub_popular_star from './../../svg//ic_hub_popular_star.svg'
import Ic_logo from './../../svg//ic_logo.svg'
import Ic_shazam_logo from './../../svg//ic_shazam_logo.svg'
import Ic_user_avatar from './../../svg//ic_user_avatar.svg'
import Add_free_black from './../../svg//marketing/add_free_black.svg'
import Gift_box_big from './../../svg//marketing/gift_box_big.svg'
import Ic_book_outlined from './../../svg//marketing/ic_book_outlined.svg'
import Ic_composition from './../../svg//marketing/ic_composition.svg'
import Ic_cross_platform from './../../svg//marketing/ic_cross_platform.svg'
import Ic_flash_icon_left from './../../svg//marketing/ic_flash_icon_left.svg'
import Ic_flash_icon_right from './../../svg//marketing/ic_flash_icon_right.svg'
import Ic_mixer_black from './../../svg//marketing/ic_mixer_black.svg'
import Ic_official_score_feature from './../../svg//marketing/ic_official_score_feature.svg'
import Ic_print_violet from './../../svg//marketing/ic_print_violet.svg'
import Ic_quick_loading from './../../svg//marketing/ic_quick_loading.svg'
import Ic_search_violet from './../../svg//marketing/ic_search_violet.svg'
import Promo_label from './../../svg//marketing/promo_label.svg'
import Score_discount_gift from './../../svg//marketing/score_discount_gift.svg'
import Triangle_group from './../../svg//marketing/triangle_group.svg'
import Waves_tour from './../../svg//marketing/waves_tour.svg'
import Wawe_left from './../../svg//marketing/wawe_left.svg'
import Wawe_right from './../../svg//marketing/wawe_right.svg'

export type SvgAssetType = 'ic_genre_blues' | 'ic_genre_classical' | 'ic_genre_comedy' | 'ic_genre_country' | 'ic_genre_darkwave' | 'ic_genre_disco' | 'ic_genre_electronic' | 'ic_genre_experimental' | 'ic_genre_folk' | 'ic_genre_hiphop' | 'ic_genre_jazz' | 'ic_genre_metal' | 'ic_genre_new_age' | 'ic_genre_pop' | 'ic_genre_reggae' | 'ic_genre_religious' | 'ic_genre_rnb' | 'ic_genre_rock' | 'ic_genre_soundtrack' | 'ic_genre_world' | 'ic_gift' | 'ic_hub_brass' | 'ic_hub_disney' | 'ic_hub_electronics' | 'ic_hub_folk' | 'ic_hub_for_you' | 'ic_hub_for_you_old' | 'ic_hub_guitar' | 'ic_hub_keyboard' | 'ic_hub_marching_percussion' | 'ic_hub_museclass' | 'ic_hub_new_for_you' | 'ic_hub_percussion' | 'ic_hub_piano' | 'ic_hub_popular' | 'ic_hub_saxophone' | 'ic_hub_strings' | 'ic_hub_trumpet' | 'ic_hub_video_game_tv' | 'ic_hub_video_game_tv_2' | 'ic_hub_voice' | 'ic_hub_woodwings' | 'ic_gift_hub' | 'ic_hub_new' | 'ic_hub_popular_star' | 'ic_logo' | 'ic_shazam_logo' | 'ic_user_avatar' | 'add_free_black' | 'gift_box_big' | 'ic_book_outlined' | 'ic_composition' | 'ic_cross_platform' | 'ic_flash_icon_left' | 'ic_flash_icon_right' | 'ic_mixer_black' | 'ic_official_score_feature' | 'ic_print_violet' | 'ic_quick_loading' | 'ic_search_violet' | 'promo_label' | 'score_discount_gift' | 'triangle_group' | 'waves_tour' | 'wawe_left' | 'wawe_right'
export interface SvgAssetProps {
  readonly type: SvgAssetType
  readonly testID?: string
  readonly nativeID?: string
  readonly style?: StyleProp<ViewStyle>
  readonly isVisible?: boolean
  readonly tint?: string
  readonly stroke?: string
  readonly color?: string
  readonly width?: number
  readonly height?: number
  readonly size?: number
}

// Icon metadata for determining fill vs stroke
const ICON_METADATA: Record<SvgAssetType, 'fill' | 'stroke' | 'both'> = {
  'ic_genre_blues': 'fill',
  'ic_genre_classical': 'fill',
  'ic_genre_comedy': 'fill',
  'ic_genre_country': 'fill',
  'ic_genre_darkwave': 'fill',
  'ic_genre_disco': 'fill',
  'ic_genre_electronic': 'fill',
  'ic_genre_experimental': 'fill',
  'ic_genre_folk': 'fill',
  'ic_genre_hiphop': 'fill',
  'ic_genre_jazz': 'fill',
  'ic_genre_metal': 'fill',
  'ic_genre_new_age': 'fill',
  'ic_genre_pop': 'fill',
  'ic_genre_reggae': 'fill',
  'ic_genre_religious': 'fill',
  'ic_genre_rnb': 'fill',
  'ic_genre_rock': 'fill',
  'ic_genre_soundtrack': 'fill',
  'ic_genre_world': 'fill',
  'ic_gift': 'fill',
  'ic_hub_brass': 'fill',
  'ic_hub_disney': 'fill',
  'ic_hub_electronics': 'fill',
  'ic_hub_folk': 'fill',
  'ic_hub_for_you': 'fill',
  'ic_hub_for_you_old': 'fill',
  'ic_hub_guitar': 'both',
  'ic_hub_keyboard': 'fill',
  'ic_hub_marching_percussion': 'fill',
  'ic_hub_museclass': 'both',
  'ic_hub_new_for_you': 'fill',
  'ic_hub_percussion': 'fill',
  'ic_hub_piano': 'fill',
  'ic_hub_popular': 'fill',
  'ic_hub_saxophone': 'fill',
  'ic_hub_strings': 'fill',
  'ic_hub_trumpet': 'both',
  'ic_hub_video_game_tv': 'fill',
  'ic_hub_video_game_tv_2': 'fill',
  'ic_hub_voice': 'fill',
  'ic_hub_woodwings': 'fill',
  'ic_gift_hub': 'fill',
  'ic_hub_new': 'fill',
  'ic_hub_popular_star': 'fill',
  'ic_logo': 'fill',
  'ic_shazam_logo': 'fill',
  'ic_user_avatar': 'fill',
  'add_free_black': 'fill',
  'gift_box_big': 'fill',
  'ic_book_outlined': 'fill',
  'ic_composition': 'fill',
  'ic_cross_platform': 'fill',
  'ic_flash_icon_left': 'fill',
  'ic_flash_icon_right': 'fill',
  'ic_mixer_black': 'fill',
  'ic_official_score_feature': 'fill',
  'ic_print_violet': 'fill',
  'ic_quick_loading': 'fill',
  'ic_search_violet': 'fill',
  'promo_label': 'fill',
  'score_discount_gift': 'fill',
  'triangle_group': 'fill',
  'waves_tour': 'fill',
  'wawe_left': 'fill',
  'wawe_right': 'fill',
}

const getIcon = (type: SvgAssetType, tint: string | undefined, stroke: string | undefined, color: string | undefined, width: number | undefined, height: number | undefined): React.ReactElement => {
    switch (type) {
  case 'ic_genre_blues': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_blues {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_classical': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_classical {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_comedy': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_comedy {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_country': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_country {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_darkwave': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_darkwave {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_disco': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_disco {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_electronic': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_electronic {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_experimental': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_experimental {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_folk': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_folk {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_hiphop': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_hiphop {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_jazz': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_jazz {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_metal': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_metal {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_new_age': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_new_age {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_pop': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_pop {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_reggae': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_reggae {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_religious': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_religious {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_rnb': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_rnb {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_rock': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_rock {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_soundtrack': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_soundtrack {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_genre_world': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_genre_world {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_gift': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_gift {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_brass': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_brass {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_disney': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_disney {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_electronics': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_electronics {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_folk': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_folk {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_for_you': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_for_you {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_for_you_old': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_for_you_old {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_guitar': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_guitar {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_keyboard': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_keyboard {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_marching_percussion': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_marching_percussion {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_museclass': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_museclass {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_new_for_you': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_new_for_you {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_percussion': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_percussion {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_piano': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_piano {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_popular': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_popular {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_saxophone': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_saxophone {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_strings': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_strings {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_trumpet': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_trumpet {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_video_game_tv': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_video_game_tv {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_video_game_tv_2': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_video_game_tv_2 {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_voice': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_voice {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_woodwings': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_woodwings {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_gift_hub': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_gift_hub {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_new': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_new {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_hub_popular_star': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_hub_popular_star {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_logo': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_logo {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_shazam_logo': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_shazam_logo {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_user_avatar': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_user_avatar {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'add_free_black': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Add_free_black {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'gift_box_big': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Gift_box_big {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_book_outlined': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_book_outlined {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_composition': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_composition {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_cross_platform': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_cross_platform {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_flash_icon_left': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_flash_icon_left {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_flash_icon_right': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_flash_icon_right {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_mixer_black': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_mixer_black {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_official_score_feature': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_official_score_feature {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_print_violet': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_print_violet {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_quick_loading': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_quick_loading {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'ic_search_violet': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Ic_search_violet {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'promo_label': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Promo_label {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'score_discount_gift': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Score_discount_gift {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'triangle_group': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Triangle_group {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'waves_tour': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Waves_tour {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'wawe_left': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Wawe_left {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  case 'wawe_right': {
    const finalFill = (color && (ICON_METADATA[type] === 'fill' || ICON_METADATA[type] === 'both')) ? color : tint
    const finalStroke = (color && (ICON_METADATA[type] === 'stroke' || ICON_METADATA[type] === 'both')) ? color : stroke
    return <Wawe_right {...(finalFill && { fill: finalFill })} {...(finalStroke && { stroke: finalStroke })} {...(width && { width })} {...(height && { height })} />
  }
  }
}

const SvgAsset = ({ type, testID, nativeID, style, isVisible, tint, stroke, color, width, height, size }: SvgAssetProps, ref: any) => {
  if (isVisible === false) return null
  if (size) {
    if (!width) width = size
    if (!height) height = size
  }
  return (
    <View ref={ref} testID={testID} accessibilityLabel={testID} nativeID={nativeID} pointerEvents={'none'} style={style}>
      {getIcon(type, tint, stroke, color, width, height)}
    </View>
  )
}
export default memo(forwardRef<ViewInstance, SvgAssetProps>(SvgAsset))
