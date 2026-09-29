import {
  Box,
  Container,
  Flex,
  Progress,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function GoalDetailSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="5xl" py={{ base: '6', md: '10' }}>
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '5', md: '7' }}
        role="status"
      >
        <Skeleton height="8" width="28" />
        <Stack gap="2">
          <Skeleton height="8" width="48%" />
          <Skeleton height="4" width="74%" />
        </Stack>
        <GoalSection lines={2} progress />
        <GoalSection lines={4} />
        <GoalSection lines={3} />
      </Stack>
    </Container>
  )
}

function GoalSection({
  lines,
  progress = false,
}: {
  lines: number
  progress?: boolean
}) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Stack gap="4">
        <Flex justify="space-between">
          <Skeleton height="5" width="34%" />
          <Skeleton height="5" width="16" />
        </Flex>
        {progress ? (
          <Progress.Root max={100} size="sm" value={0}>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        ) : null}
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            height="4"
            key={index}
            width={index % 2 === 0 ? '76%' : '58%'}
          />
        ))}
      </Stack>
    </Box>
  )
}
