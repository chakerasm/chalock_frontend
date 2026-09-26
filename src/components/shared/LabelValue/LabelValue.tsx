import { Box, Flex, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type LabelValueProps = {
  label: ReactNode
  value?: ReactNode
  orientation?: 'horizontal' | 'vertical'
}

export function LabelValue({
  label,
  value,
  orientation = 'vertical',
}: LabelValueProps) {
  const { t } = useTranslation()

  return (
    <Flex
      align={orientation === 'horizontal' ? 'baseline' : 'stretch'}
      as="div"
      direction={orientation === 'horizontal' ? 'row' : 'column'}
      gap={orientation === 'horizontal' ? '4' : '1'}
      justify={orientation === 'horizontal' ? 'space-between' : undefined}
    >
      <Text as="dt" color="fg.muted" fontSize="sm">
        {label}
      </Text>
      <Box as="dd" fontWeight="medium" m="0">
        {value ?? t('common.notAvailable')}
      </Box>
    </Flex>
  )
}
