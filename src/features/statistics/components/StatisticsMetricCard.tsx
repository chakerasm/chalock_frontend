import { Box, Flex, HStack, Stack, Text } from '@chakra-ui/react'
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
      bg="bg.elevated"
      borderColor="border.subtle"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l3"
      shadow="sm"
    >
      <HStack align="start" justify="space-between">
        <Stack gap="1">
          <Text color="fg.muted" fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontVariantNumeric="tabular-nums"
            fontWeight="semibold"
            letterSpacing="tight"
          >
            {value}
          </Text>
          {detail ? (
            <Text color="fg.muted" fontSize="xs">
              {detail}
            </Text>
          ) : null}
        </Stack>
        <Flex
          align="center"
          bg="brand.subtle"
          color="brand.fg"
          h="10"
          justify="center"
          rounded="l1"
          w="10"
        >
          {icon}
        </Flex>
      </HStack>
    </Box>
  )
}