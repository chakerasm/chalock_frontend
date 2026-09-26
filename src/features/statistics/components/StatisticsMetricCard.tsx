import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type StatisticsMetricCardProps = {
  detail?: string
  icon: ReactNode
  label: string
  value: string
}

export function StatisticsMetricCard({
  detail,
  icon,
  label,
  value,
}: StatisticsMetricCardProps) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <HStack align="start" justify="space-between">
        <Stack gap="1">
          <Text color="fg.muted" fontSize="sm">
            {label}
          </Text>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontVariantNumeric="tabular-nums"
            fontWeight="semibold"
          >
            {value}
          </Text>
          {detail ? (
            <Text color="fg.muted" fontSize="xs">
              {detail}
            </Text>
          ) : null}
        </Stack>
        <Box color="brand.fg" pt="1">
          {icon}
        </Box>
      </HStack>
    </Box>
  )
}
