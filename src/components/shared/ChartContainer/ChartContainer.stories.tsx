import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartContainer } from './ChartContainer'

const meta = { component: ChartContainer, title: 'Shared/ChartContainer' } satisfies Meta<typeof ChartContainer>
export default meta
type Story = StoryObj<typeof meta>
export const Empty: Story = { args: { ariaLabel: 'Example chart', emptyDescription: 'Add records to see your trend.', isEmpty: true, title: 'Example chart' } }
