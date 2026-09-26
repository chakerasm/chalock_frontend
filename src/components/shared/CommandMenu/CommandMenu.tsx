import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  IconButton,
  Input,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { Command, FileText, FlaskConical, Home, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CommandItem = {
  icon: typeof Home
  id: string
  to: '/' | '/example-future' | '/fields'
  label: string
}

export function CommandMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const commands: CommandItem[] = [
    { icon: Home, id: 'home', label: t('app.home'), to: '/' },
    {
      icon: FlaskConical,
      id: 'example-future',
      label: t('exampleFuture.navigationLabel'),
      to: '/example-future',
    },
    {
      icon: FileText,
      id: 'fields',
      label: t('appShell.fieldShowcase'),
      to: '/fields',
    },
  ]
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matchingCommands = commands.filter((item) =>
    item.label.toLocaleLowerCase().includes(normalizedQuery),
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLocaleLowerCase() === 'k'
      ) {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  function goTo(to: CommandItem['to']) {
    setIsOpen(false)
    void navigate({ to })
  }

  return (
    <>
      <Button
        aria-label={t('appShell.openSearch')}
        display={{ base: 'none', sm: 'inline-flex' }}
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
      >
        <Search aria-hidden="true" size={16} />
        {t('appShell.search')}
        <HStack color="fg.muted" fontSize="xs" gap="0">
          <Command aria-hidden="true" size={12} />
          <Text>K</Text>
        </HStack>
      </Button>
      <IconButton
        aria-label={t('appShell.openSearch')}
        display={{ base: 'inline-flex', sm: 'none' }}
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="ghost"
      >
        <Search aria-hidden="true" size={18} />
      </IconButton>
      <Dialog.Root
        onOpenChange={(details) => setIsOpen(details.open)}
        open={isOpen}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={{ base: '4', md: '8' }}>
            <Dialog.Content maxW="xl">
              <Dialog.Header>
                <Dialog.Title>{t('appShell.search')}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Input
                    aria-label={t('appShell.search')}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('appShell.searchPlaceholder')}
                    ref={inputRef}
                    value={query}
                  />
                  <Stack gap="1">
                    {matchingCommands.map((item) => {
                      const Icon = item.icon

                      return (
                        <Button
                          justifyContent="flex-start"
                          key={item.id}
                          onClick={() => goTo(item.to)}
                          variant="ghost"
                        >
                          <Icon aria-hidden="true" size={18} />
                          {item.label}
                        </Button>
                      )
                    })}
                    {matchingCommands.length === 0 ? (
                      <Text color="fg.muted" fontSize="sm" py="3">
                        {t('appShell.noSearchResults')}
                      </Text>
                    ) : null}
                  </Stack>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
