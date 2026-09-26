import { Button } from '@chakra-ui/react'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'

type CopyButtonProps = {
  value: string
  label?: string
  onCopy?: () => void
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'outline' | 'solid'
}

export function CopyButton({
  value,
  label,
  onCopy,
  size = 'sm',
  variant = 'outline',
}: CopyButtonProps) {
  const { t } = useTranslation()
  const [hasCopied, setHasCopied] = useState(false)
  const buttonLabel = label ?? t('copyButton.action')

  useEffect(() => {
    if (!hasCopied) {
      return
    }

    const timeoutId = window.setTimeout(() => setHasCopied(false), 2_000)

    return () => window.clearTimeout(timeoutId)
  }, [hasCopied])

  async function handleCopy() {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard access is unavailable.')
      }

      await navigator.clipboard.writeText(value)
      setHasCopied(true)
      onCopy?.()
      toast.success({ title: t('copyButton.success') })
    } catch {
      toast.error({ title: t('copyButton.error') })
    }
  }

  return (
    <Button
      aria-label={buttonLabel}
      onClick={() => void handleCopy()}
      size={size}
      type="button"
      variant={variant}
    >
      {hasCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {buttonLabel}
    </Button>
  )
}
