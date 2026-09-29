import {
  Container,
  HStack,
  Progress,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function GoalsListSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="5xl" py={{ base: '6', md: '10' }}>
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '5', md: '7' }}
        role="status"
      >
        <Stack gap="2">
          <Skeleton height="4" width="24%" />
          <Skeleton height="8" width="30%" />
          <Skeleton height="4" width="58%" />
        </Stack>
        <HStack gap="2">
          <Skeleton height="8" width="16" />
          <Skeleton height="8" width="20" />
          <Skeleton height="8" width="18" />
        </HStack>
        <Stack
          bg="bg.panel"
          borderWidth="1px"
          gap="0"
          px={{ base: '4', md: '5' }}
          rounded="l2"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Stack
              borderBottomWidth={index === 3 ? '0' : '1px'}
              gap="3"
              key={index}
              py="4"
            >
              <Skeleton height="5" width={index % 2 === 0 ? '42%' : '56%'} />
              <Skeleton height="3" width="68%" />
              <Progress.Root max={100} size="sm" value={0}>
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Skeleton height="3" width="36%" />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
