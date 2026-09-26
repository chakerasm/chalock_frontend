import { Stack, Text } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Stack align="center" color="fg.muted" gap="3" py="12" textAlign="center">
      <Inbox aria-hidden="true" size={28} />
      <Text fontWeight="medium">{title}</Text>
      {description ? <Text fontSize="sm">{description}</Text> : null}
    </Stack>
  )
}
