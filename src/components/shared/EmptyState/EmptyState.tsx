import { Box, Stack, Text } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Stack align="center" color="fg.muted" gap="3" py="12" textAlign="center">
      <Box alignItems="center" bg="bg.subtle" borderColor="border.subtle" borderWidth="1px" color="brand.fg" display="flex" h="12" justifyContent="center" rounded="l2" w="12">
        <Inbox aria-hidden="true" size={24} />
      </Box>
      <Text color="fg" fontWeight="semibold">{title}</Text>
      {description ? <Text fontSize="sm" maxW="md">{description}</Text> : null}
    </Stack>
  )
}
