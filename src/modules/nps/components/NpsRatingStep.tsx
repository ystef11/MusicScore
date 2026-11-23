import { npsTestIds } from '@mu/mu-mobile-test-id'
import { translate } from '@mu-native/locale'

import { NpsRatingScale } from './NpsRatingScale'
import { NpsStep } from './NpsStep'

type TProps = {
    rating: number | null
    onChange: (rating: number) => void
    onSubmit: () => void
}

export const NpsRatingStep = ({ rating, onChange, onSubmit }: TProps) => (
    <NpsStep
        title={translate('native.nps.rating_title')}
        isSubmitDisabled={rating === null}
        submitTestID={npsTestIds.ratingSubmitButton}
        onSubmit={onSubmit}
    >
        <NpsRatingScale rating={rating} onChange={onChange} />
    </NpsStep>
)
