import { Flex, Image } from '@chakra-ui/react'
import { useState } from 'react'
import type { Subscription } from '@/features/subscriptions/types/subscriptions.types'

type SubscriptionAvatarProps = {
  background?: string
  size?: 'sm' | 'md'
  subscription: Subscription
}

const avatarSizes = {
  sm: '8',
  md: '10',
} as const

export function SubscriptionAvatar({
  background = 'brand.subtle',
  size = 'sm',
  subscription,
}: SubscriptionAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const dimension = avatarSizes[size]
  const showImage = Boolean(subscription.imageUrl) && !hasImageError

  return (
    <Flex
      align="center"
      bg={background}
      color="white"
      flexShrink="0"
      h={dimension}
      justify="center"
      overflow="hidden"
      rounded="control"
      w={dimension}
      fontSize={size === 'sm' ? 'sm' : 'md'}
      fontWeight="bold"
    >
      {showImage ? (
        <Image
          alt=""
          h="full"
          objectFit="cover"
          onError={() => setHasImageError(true)}
          src={subscription.imageUrl}
          w="full"
        />
      ) : (
        subscription.name.slice(0, 1).toUpperCase()
      )}
    </Flex>
  )
}
