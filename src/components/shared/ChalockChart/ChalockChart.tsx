import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type ChartDatum = Record<string, string | number>
export type ChartSeries = { color: string; dataKey: string; label: string }

type BaseProps = { ariaLabel: string; data: ChartDatum[]; formatValue: (value: number) => string; series: ChartSeries[]; xKey: string }

function ChalockTooltip({ active, label, payload, formatValue }: { active?: boolean; label?: string; payload?: Array<{ color?: string; name?: string; value?: number }>; formatValue: (value: number) => string }) {
  if (!active || !payload?.length) return null
  return <Box bg="chart.tooltipBg" borderColor="chart.tooltipBorder" borderWidth="1px" minW="9rem" p="2.5" rounded="l1" shadow="md"><Text fontSize="xs" fontWeight="semibold" mb="1.5">{label}</Text><Stack gap="1">{payload.map((entry) => <HStack justify="space-between" key={entry.name}><HStack gap="1.5"><Box bg={entry.color} boxSize="2" rounded="full"/><Text color="fg.muted" fontSize="xs">{entry.name}</Text></HStack><Text fontSize="xs" fontWeight="medium">{formatValue(entry.value ?? 0)}</Text></HStack>)}</Stack></Box>
}

function ChartAxes({ xKey }: { xKey: string }) {
  return <><CartesianGrid horizontal stroke="var(--chakra-colors-chart-grid)" strokeDasharray="3 4" vertical={false}/><XAxis axisLine={false} dataKey={xKey} dy={8} tick={{ fill: 'var(--chakra-colors-chart-axis)', fontSize: 11 }} tickLine={false}/><YAxis axisLine={false} tick={{ fill: 'var(--chakra-colors-chart-axis)', fontSize: 11 }} tickFormatter={(value) => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)} tickLine={false} width={36}/></>
}

export function CategoryBarChart({ ariaLabel, data, formatValue, series, xKey }: BaseProps) {
  return <ResponsiveContainer aria-label={ariaLabel} height="100%" width="100%"><BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}><ChartAxes xKey={xKey}/><Tooltip content={<ChalockTooltip formatValue={formatValue}/>}/>{series.map((item) => <Bar dataKey={item.dataKey} fill={item.color} key={item.dataKey} maxBarSize={32} name={item.label} radius={[4, 4, 0, 0]}/>)}</BarChart></ResponsiveContainer>
}

export function TrendLineChart({ ariaLabel, data, formatValue, series, xKey }: BaseProps) {
  return <ResponsiveContainer aria-label={ariaLabel} height="100%" width="100%"><LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}><ChartAxes xKey={xKey}/><Tooltip content={<ChalockTooltip formatValue={formatValue}/>}/>{series.map((item) => <Line activeDot={{ r: 4 }} dataKey={item.dataKey} dot={false} key={item.dataKey} name={item.label} stroke={item.color} strokeWidth={2.5} type="monotone"/>)}</LineChart></ResponsiveContainer>
}
