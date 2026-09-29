import { Box, Container, Grid, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function TodayDashboardSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="7xl" py={{ base: '6', md: '10' }}>
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '5', md: '7' }}
        role="status"
      >
        <Stack gap="2" maxW="lg">
          <Skeleton height="4" width="28%" />
          <Skeleton height="8" width="55%" />
          <Skeleton height="4" width="80%" />
        </Stack>
        <Grid
          gap={{ base: '4', md: '5' }}
          templateColumns={{
            base: '1fr',
            xl: 'minmax(0, 1.45fr) minmax(20rem, 0.9fr)',
          }}
        >
          <DashboardCard lines={4} />
          <DashboardCard lines={3} />
          <DashboardCard lines={4} />
          <DashboardCard lines={2} />
          <DashboardCard lines={3} />
        </Grid>
      </Stack>
    </Container>
  )
}

function DashboardCard({ lines }: { lines: number }) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Stack gap="4">
        <Skeleton height="5" width="42%" />
        {Array.from({ length: lines }, (_, index) => (
          <Stack
            borderTopWidth={index === 0 ? '0' : '1px'}
            gap="2"
            key={index}
            pt={index === 0 ? '0' : '3'}
          >
            <Skeleton height="4" width={index % 2 === 0 ? '72%' : '58%'} />
            <Skeleton height="3" width="32%" />
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
