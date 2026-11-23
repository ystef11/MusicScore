import { marketingConstants } from '../constants/marketingConstants'
import { TContentTypes, TProductId } from '../types/marketingTypes'

export const getContentTypeByProductId = (productId: TProductId) =>
    ({
        [marketingConstants.inAppScore39]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore59]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore79]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore99]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore119]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore139]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore36]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore719]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore48]: TContentTypes.scoreInApp,
        [marketingConstants.inAppScore839]: TContentTypes.scoreInApp,
        [marketingConstants.inAppCourse]: TContentTypes.courseInApp,
        [marketingConstants.inAppBook20Cost]: TContentTypes.ebookInApp,
        [marketingConstants.inAppBook35Cost]: TContentTypes.ebookInApp,
        [marketingConstants.inAppBook55Cost]: TContentTypes.ebookInApp,
    })[productId] || TContentTypes.creditInApp
