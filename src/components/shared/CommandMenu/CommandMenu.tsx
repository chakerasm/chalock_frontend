import {
  Button,
  CloseButton,
  Dialog,
  Input,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import {
  CalendarCheck,
  FileText,
  FlaskConical,
  ListTodo,
  Search,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CommandItem = {
  id: string
  label: string
  to: '/' | '/example-future' | '/fields' | '/tasks'
}

export function CommandMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const commands: CommandItem[] = [
    { id: 'today', label: t('app.home'), to: '/' },
    {
      id: 'example-future',
      label: t('exampleFuture.navigationLabel'),
      to: '/example-future',
    },
    { id: 'fields', label: t('appShell.fieldShowcase'), to: '/fields' },
    { id: 'tasks', label: t('tasks.title'), to: '/tasks' },
  ]
  const matchingCommands = commands.filter((item) =>
    item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
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
        onClick={() => setIsOpen(true)}
        size={'sm'}
        variant={'outline'}
      >
        <Search aria-hidden={true} size={16} />
        {t('appShell.search')}
      </Button>
      <Dialog.Root
        onOpenChange={(details) => setIsOpen(details.open)}
        open={isOpen}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={'4'}>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{t('appShell.search')}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size={'sm'} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={'4'}>
                  <Input
                    aria-label={t('appShell.search')}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('appShell.searchPlaceholder')}
                    ref={inputRef}
                    value={query}
                  />
                  {matchingCommands.map((item) => (
                    <Button
                      justifyContent={'flex-start'}
                      key={item.id}
                      onClick={() => goTo(item.to)}
                      variant={'ghost'}
                    >
                      {item.id === 'today' ? (
                        <CalendarCheck aria-hidden={true} size={18} />
                      ) : item.id === 'tasks' ? (
                        <ListTodo aria-hidden={true} size={18} />
                      ) : item.id === 'fields' ? (
                        <FileText aria-hidden={true} size={18} />
                      ) : (
                        <FlaskConical aria-hidden={true} size={18} />
                      )}
                      {item.label}
                    </Button>
                  ))}
                  {matchingCommands.length === 0 ? (
                    <Text color={'fg.muted'} fontSize={'sm'}>
                      {t('appShell.noSearchResults')}
                    </Text>
                  ) : null}
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
