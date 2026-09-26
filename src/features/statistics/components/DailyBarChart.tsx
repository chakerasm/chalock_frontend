import { Box, Flex, Text } from '@chakra-ui/react'

type DailyBarChartProps = {
  ariaLabel: string
  data: Array<{ date: string; value: number }>
  formatDate: (date: string) => string
  formatValue: (value: number) => string
}

export function DailyBarChart({
  ariaLabel,
  data,
  formatDate,
  formatValue,
}: DailyBarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)
  const middleIndex = Math.floor((data.length - 1) / 2)

  return (
    <Box>
      <Flex align="end" aria-label={ariaLabel} gap="1" h="28" role="img">
        {data.map((item) => {
          const height =
            item.value > 0 ? Math.max((item.value / maxValue) * 100, 5) : 3
          return (
            <Box
              aria-hidden="true"
              bg={item.value > 0 ? 'brand.solid' : 'bg.subtle'}
              flex="1"
              h={`${height}%`}
              key={item.date}
              minW="1"
              rounded="sm"
              title={`${formatDate(item.date)}: ${formatValue(item.value)}`}
            />
          )
        })}
      </Flex>
      <Flex color="fg.muted" fontSize="xs" justify="space-between" mt="2">
        <Text>{formatDate(data[0].date)}</Text>
        <Text>{formatDate(data[middleIndex].date)}</Text>
        <Text>{formatDate(data[data.length - 1].date)}</Text>
      </Flex>
    </Box>
  )
}
