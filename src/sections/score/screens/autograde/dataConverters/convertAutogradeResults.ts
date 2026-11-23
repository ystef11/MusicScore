export const convertAutogradeResults = ({
    Accuracy: accuracy,
    Rhythm: rhythm,
}: {
    Accuracy?: number
    Rhythm?: number
}) => ({ accuracy: accuracy ?? 0, rhythm: rhythm ?? 0 })
