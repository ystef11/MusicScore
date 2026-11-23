/**
 * Packs unknown/custom event params into the params.key/params.value/params.str_value
 * distributed array format that the backend accepts.
 *
 * Known params (those matching a column in any channel's table) pass through as-is.
 * Unknown primitive params get encoded into the parallel arrays.
 */

/** All field names accepted by at least one channel table */
const KNOWN_PARAMS = new Set([
    // Auto-populated (global params, channel system)
    'screen',
    'previous_screen',
    'previousScreen',
    'source',
    'country',
    'datetime_timer',
    'score_type',
    'connection',
    'event',
    '_type',

    // Distributed arrays (pass through)
    'params.key',
    'params.value',
    'params.str_value',

    // Score events
    'score_id',
    'is_score_by_pro',
    'score_published',
    'score_instruments',
    'item',
    'search_session_id',

    // Course events
    'course_id',
    'unit_id',
    'lesson_id',
    'content_id',
    'content_open_id',
    'license_material_id',
    'license_content_id',
    'license_access_type',
    'author_id',
    'additional_authors_ids',
    'feed.type',
    'feed.id',
    'content_index',
    'viewing_time',
    'event_video_time',
    'content_length',
    'content_type',
    'content_placement',
    'is_trial',
    'tariff_start_date',
    'trial_end_date',
    'tariff_end_date',
    'subscription_tariff',

    // Monetization events
    'event_old',
    'value',
    'ui',
    'item_id',
    'subscription_type',
    'subscription_purchase',
    'landing_name',
    'funnel_type',
    'funnel_source',
    'funnel_start_action',
    'quiz_answer.question',
    'quiz_answer.value',
    'have_quiz',
    'user_segments',
    'device_data.parameter',
    'device_data.value',

    // Push events
    'push_token',
    'bm_campaign_name',
    'bm_campaign_id',
    'bm_action_name',
    'push_type',
    'push_sent_time',
    'push_title',
    'push_message',

    // Search events
    'search_type',
    'search_session_text',
    'search_query_id',
    'search_filters_group',
    'search_filters',
    'search_sort',
    'search_session_results_cnt',
    'search_result_page_num',
    'search_result_block_name',
    'search_result_entity',
    'search_result_entity_id',
    'search_result_entity_place',
    'search_result_entity_num',

    // User session events
    'event2',
    'user_agent',
    'is_bot',
    'utm_params.key',
    'utm_params.value',

    // Songbook events
    'songbook_id',

    // NPS events
    'nps_campaign_name',
    'nps_rating_score',
    'nps_feedback_text',
    'nps_trigger_name',

    // Common
    'url',
    'referer',
    'browser',
    'browser_version',

    // UTM
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
])

export function packCustomParams(params: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    const customKeys: string[] = []
    const customValues: (number | null)[] = []
    const customStrValues: (string | null)[] = []
    const packedKeys = new Set((params['params.key'] as string[] | undefined) ?? [])

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return

        if (KNOWN_PARAMS.has(key)) {
            result[key] = value
            return
        }

        if (packedKeys.has(key)) return

        if (typeof value === 'number') {
            customKeys.push(key)
            customValues.push(value)
            customStrValues.push(null)
        } else if (typeof value === 'boolean') {
            customKeys.push(key)
            customValues.push(value ? 1 : 0)
            customStrValues.push(null)
        } else if (typeof value === 'string') {
            customKeys.push(key)
            customValues.push(null)
            customStrValues.push(value)
        }
    })

    if (customKeys.length > 0) {
        const existingKeys = (result['params.key'] as string[]) ?? []
        const existingValues = (result['params.value'] as (number | null)[]) ?? []
        const existingStrValues = (result['params.str_value'] as (string | null)[]) ?? []

        result['params.key'] = [...existingKeys, ...customKeys]
        result['params.value'] = [...existingValues, ...customValues]
        result['params.str_value'] = [...existingStrValues, ...customStrValues]
    }

    return result
}
