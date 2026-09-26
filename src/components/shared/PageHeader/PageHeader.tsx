import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: PageHeaderProps) {
  return (
    <Flex
      align={{ base: 'flex-start', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap="4"
      justify="space-between"
    >
      <Stack gap="2">
        {eyebrow ? (
          <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
            {eyebrow}
          </Text>
        ) : null}
        <Box>
          <Heading as="h1" size={{ base: '2xl', md: '3xl' }}>
            {title}
          </Heading>
          {description ? (
            <Text color="fg.muted" lineHeight="tall" mt="2">
              {description}
            </Text>
          ) : null}
        </Box>
      </Stack>
      {actions ? (
        <Flex gap="2" wrap="wrap">
          {actions}
        </Flex>
      ) : null}
    </Flex>
  )
}
