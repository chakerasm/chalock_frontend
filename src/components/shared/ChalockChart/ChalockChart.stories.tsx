import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box } from '@chakra-ui/react'
import { CategoryBarChart } from './ChalockChart'

const meta = { component: CategoryBarChart, title: 'Shared/ChalockChart' } satisfies Meta<typeof CategoryBarChart>
export default meta
type Story = StoryObj<typeof meta>
export const Bars: Story = { args: { ariaLabel: 'Weekly activity', data: [{ day: 'Mon', value: 4 }, { day: 'Tue', value: 8 }, { day: 'Wed', value: 5 }], formatValue: (value) => String(value), series: [{ color: 'var(--chakra-colors-chart-primary)', dataKey: 'value', label: 'Completed' }], xKey: 'day' }, render: (args) => <Box h="280px"><CategoryBarChart {...args} /></Box> }
