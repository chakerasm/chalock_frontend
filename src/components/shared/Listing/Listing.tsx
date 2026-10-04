import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type ListingProps = {
  children: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  toolbar?: ReactNode
}

export function Listing({
  children,
  title,
  description,
  actions,
  toolbar,
}: ListingProps) {
  return (
    <Stack as="section" gap="5">
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="4"
        justify="space-between"
      >
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            {title}
          </Text>
          {description ? (
            <Text color="fg.muted" fontSize="sm" mt="1">
              {description}
            </Text>
          ) : null}
        </Box>
        {actions ? (
          <Flex gap="2" wrap="wrap">
            {actions}
          </Flex>
        ) : null}
      </Flex>
      {toolbar ? (
        <Box bg="bg.subtle" borderColor="border.subtle" borderRadius="l2" borderWidth="1px" px="3" py="2">
          {toolbar}
        </Box>
      ) : null}
      <Box bg="bg.panel" borderColor="border.subtle" borderWidth="1px" overflowX="auto" rounded="l2" shadow="xs">
        {children}
      </Box>
    </Stack>
  )
}
