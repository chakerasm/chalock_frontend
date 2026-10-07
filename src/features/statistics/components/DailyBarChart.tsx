import { Box } from '@chakra-ui/react'
import { CategoryBarChart } from '@/components/shared/ChalockChart/ChalockChart'

type DailyBarChartProps = {
  ariaLabel: string
  data: Array<{ date: string; value: number }>
  formatDate: (date: string) => string
  formatValue: (value: number) => string
}

export function DailyBarChart({
  ariaLabel,
  data,
  formatDate,
  formatValue,
}: DailyBarChartProps) {
  return (
    <Box h="28">
      <CategoryBarChart
        ariaLabel={ariaLabel}
        data={data.map((item) => ({ label: formatDate(item.date), value: item.value }))}
        formatValue={formatValue}
        series={[{ color: 'var(--chakra-colors-chart-primary)', dataKey: 'value', label: ariaLabel }]}
        xKey="label"
      />
    </Box>
  )
}
