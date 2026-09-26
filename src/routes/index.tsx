import { Box, Container, Stack, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { t } = useTranslation()

  return (
    <Container maxW="5xl" py={{ base: '16', md: '24' }}>
      <Stack gap="8">
        <PageHeader
          description={t('home.description')}
          eyebrow={t('home.eyebrow')}
          title={t('home.heading')}
        />
        <Box
          borderWidth="1px"
          maxW="3xl"
          p={{ base: '5', md: '6' }}
          rounded="lg"
        >
          <Text color="fg.muted" fontSize="sm" lineHeight="tall">
            {t('home.guidance')}
          </Text>
        </Box>
      </Stack>
    </Container>
  )
}
