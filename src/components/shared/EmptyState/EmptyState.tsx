import { Box, Image, Stack, Text } from '@chakra-ui/react'
import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
  illustrationSrc?: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ title, description, icon: Icon = Inbox, illustrationSrc, action, compact = false }: EmptyStateProps) {
  return (
    <Stack align="center" color="fg.muted" gap="3" py={compact ? "6" : "12"} textAlign="center">
      {illustrationSrc ? (
        <Image alt="" aria-hidden="true" h={compact ? "16" : "28"} objectFit="contain" src={illustrationSrc} w={compact ? "16" : "28"} />
      ) : (
        <Box alignItems="center" bg="bg.subtle" borderColor="border.subtle" borderWidth="1px" color="brand.fg" display="flex" h={compact ? "10" : "12"} justifyContent="center" rounded="l2" w={compact ? "10" : "12"}>
          <Icon aria-hidden="true" size={compact ? 20 : 24} />
        </Box>
      )}
      <Text color="fg" fontWeight="semibold">{title}</Text>
      {description ? <Text fontSize="sm" maxW="md">{description}</Text> : null}
      {action ? <Box pt="1">{action}</Box> : null}
    </Stack>
  )
}
