import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { HabitConsistencyDay } from '@/features/statistics/types/statistics.types'

type HabitConsistencyHeatmapProps = {
  ariaLabel: string
  data: HabitConsistencyDay[]
  formatDate: (date: string) => string
  formatRate: (rate: number) => string
}

export function HabitConsistencyHeatmap({
  ariaLabel,
  data,
  formatDate,
  formatRate,
}: HabitConsistencyHeatmapProps) {
  return (
    <Stack gap="2">
      <Flex aria-label={ariaLabel} gap="2" role="img" wrap="wrap">
        {data.map((day) => (
          <Box
            aria-hidden="true"
            bg={getBackground(day.rate)}
            borderWidth={day.rate === null ? '1px' : '0'}
            h="7"
            key={day.date}
            rounded="sm"
            title={
              day.rate === null
                ? `${formatDate(day.date)}: —`
                : `${formatDate(day.date)}: ${formatRate(day.rate)}`
            }
            w="7"
          />
        ))}
      </Flex>
      <Flex color="fg.muted" fontSize="xs" justify="space-between">
        <Text>{formatDate(data[0].date)}</Text>
        <Text>{formatDate(data[data.length - 1].date)}</Text>
      </Flex>
    </Stack>
  )
}

function getBackground(rate: number | null) {
  if (rate === null) return 'bg.panel'
  if (rate === 0) return 'bg.subtle'
  if (rate < 1) return 'brand.muted'
  return 'brand.solid'
}
