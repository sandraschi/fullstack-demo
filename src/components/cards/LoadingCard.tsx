import { Skeleton, SkeletonText, Stack } from '@chakra-ui/react'
import { BaseCard } from './BaseCard'

interface Props {
  title: string
}

export function LoadingCard({ title }: Props) {
  return (
    <BaseCard title={title}>
      <Stack gap={3}>
        <Skeleton height="20px" />
        <SkeletonText noOfLines={3} />
        <Skeleton height="16px" width="60%" />
      </Stack>
    </BaseCard>
  )
}
