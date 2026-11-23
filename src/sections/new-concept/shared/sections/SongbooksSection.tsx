import { RecommendedDigitalEbooksCarousel } from '@mu-native/ebooks-main-screen'

type TProps = { title?: string }

export const SongbooksSection = ({ title }: TProps) => (
    <RecommendedDigitalEbooksCarousel title={title} />
)
