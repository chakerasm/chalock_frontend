import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldPassword } from '@/components/ui/FieldPassword/FieldPassword'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { loginInputSchema } from '@/features/auth/schemas/auth.schemas'
import type { LoginInput } from '@/features/auth/types/auth.types'

type LoginPageProps = {
  onSuccess: () => void
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { t } = useTranslation()
  const auth = useAuth()
  const [error, setError] = useState<string>()
  const form = useForm<LoginInput>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginInputSchema),
  })

  async function submit(values: LoginInput) {
    setError(undefined)
    try {
      await auth.signIn(values)
      onSuccess()
    } catch {
      setError(t('auth.loginError'))
    }
  }

  return (
    <Container maxW="md" py={{ base: '12', md: '20' }}>
      <Box
        bg="bg.panel"
        borderWidth="1px"
        p={{ base: '6', md: '8' }}
        rounded="l2"
      >
        <form onSubmit={form.handleSubmit(submit)}>
          <Stack gap="6">
            <Stack gap="2">
              <Text color="brand.fg" fontSize="sm" fontWeight="semibold">
                {t('app.name')}
              </Text>
              <Heading size="2xl">{t('auth.title')}</Heading>
              <Text color="fg.muted">{t('auth.description')}</Text>
            </Stack>
            <Stack gap="4">
              <FieldInput
                control={form.control}
                label={t('auth.email')}
                name="email"
                required
                type="email"
              />
              <FieldPassword
                control={form.control}
                label={t('auth.password')}
                name="password"
                required
              />
              {error ? (
                <Text color="danger.fg" role="alert">
                  {error}
                </Text>
              ) : null}
            </Stack>
            <Button
              colorPalette="brand"
              loading={form.formState.isSubmitting}
              type="submit"
            >
              <LogIn aria-hidden="true" size={18} />
              {t('auth.signIn')}
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  )
}
