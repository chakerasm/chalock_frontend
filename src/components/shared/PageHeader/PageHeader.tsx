import { Flex, Heading, Stack, Text } from '@chakra-ui/react'
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
      align={{ base: 'flex-start', md: 'flex-end' }}
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: '5', md: '6' }}
      justify="space-between"
    >
      <Stack gap="3" maxW="2xl">
        {eyebrow ? (
          <Text
            color="brand.fg"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="wider"
            textTransform="uppercase"
          >
            {eyebrow}
          </Text>
        ) : null}
        <Stack gap="2">
          <Heading
            as="h1"
            letterSpacing="tight"
            lineHeight="none"
            size={{ base: '3xl', md: '4xl' }}
          >
            {title}
          </Heading>
          {description ? (
            <Text color="fg.muted" lineHeight="tall" maxW="xl">
              {description}
            </Text>
          ) : null}
        </Stack>
      </Stack>
      {actions ? (
        <Flex flexShrink="0" gap="2" wrap="wrap">
          {actions}
        </Flex>
      ) : null}
    </Flex>
  )
}