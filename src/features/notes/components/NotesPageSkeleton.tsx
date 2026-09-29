import { Box, Button, Flex, Grid, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function NotesPageSkeleton() {
  const { t } = useTranslation()

  return (
    <Box
      maxW="7xl"
      mx="auto"
      px={{ base: '4', md: '8' }}
      py={{ base: '6', md: '10' }}
    >
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '5', md: '7' }}
        role="status"
      >
        <Stack gap="2">
          <Skeleton height="4" width="22%" />
          <Skeleton height="8" width="28%" />
          <Skeleton height="4" width="62%" />
        </Stack>
        <Grid
          alignItems="start"
          gap={{ base: '4', lg: '5' }}
          templateColumns={{
            base: '1fr',
            lg: 'minmax(18rem, 0.8fr) minmax(0, 1.4fr)',
          }}
        >
          <Stack gap="4">
            <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
              <Stack gap="3">
                <Skeleton height="20" />
                <Button
                  alignSelf="flex-end"
                  disabled
                  size="sm"
                  variant="outline"
                >
                  <Skeleton height="3" width="12" />
                </Button>
              </Stack>
            </Box>
            <Skeleton height="10" />
            <Stack bg="bg.panel" borderWidth="1px" gap="3" p="3" rounded="l2">
              {Array.from({ length: 5 }, (_, index) => (
                <Stack
                  borderBottomWidth={index === 4 ? '0' : '1px'}
                  gap="2"
                  key={index}
                  pb={index === 4 ? '0' : '3'}
                >
                  <Skeleton
                    height="4"
                    width={index % 2 === 0 ? '66%' : '84%'}
                  />
                  <Skeleton height="3" width="42%" />
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Box
            bg="bg.panel"
            borderWidth="1px"
            minH={{ base: '24rem', lg: '38rem' }}
            p="4"
            rounded="l2"
          >
            <Stack gap="4">
              <Flex justify="space-between">
                <Skeleton height="3" width="20" />
                <Skeleton borderRadius="full" boxSize="8" />
              </Flex>
              <Skeleton height="7" width="54%" />
              <Skeleton height="4" width="96%" />
              <Skeleton height="4" width="88%" />
              <Skeleton height="4" width="72%" />
            </Stack>
          </Box>
        </Grid>
      </Stack>
    </Box>
  )
}
