import { Box, Flex, Text } from '@chakra-ui/react'
import { ChevronRight, type LucideIcon } from 'lucide-react'

type GoalDetailMetricProps = {
  icon: LucideIcon
  label: string
  value: string | number
}

export const GoalDetailMetric = ({
  icon: Icon,
  label,
  value,
}: GoalDetailMetricProps) => (
  <Flex
    align="center"
    bg="bg.panel"
    borderColor="border.subtle"
    borderWidth="1px"
    gap="3"
    minW="0"
    p="3"
    rounded="l2"
    shadow="xs"
  >
    <Flex
      align="center"
      bg="brand.subtle"
      color="brand.fg"
      h="9"
      justify="center"
      rounded="l1"
      w="9"
    >
      <Icon aria-hidden="true" size={18} />
    </Flex>
    <Box minW="0">
      <Text fontSize="md" fontWeight="bold" lineHeight="1.1">
        {value}
      </Text>
      <Text color="fg.muted" fontSize="xs" lineClamp={1} mt="1">
        {label}
      </Text>
    </Box>
    <ChevronRight
      aria-hidden="true"
      color="var(--chakra-colors-fg-muted)"
      size={16}
    />
  </Flex>
)
