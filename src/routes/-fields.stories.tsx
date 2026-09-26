import { Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldCheckbox } from '@/components/ui/FieldCheckbox/FieldCheckbox'
import { FieldDatePicker } from '@/components/ui/FieldDatePicker/FieldDatePicker'
import { FieldDatePickerInterval } from '@/components/ui/FieldDatePickerInterval/FieldDatePickerInterval'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldPassword } from '@/components/ui/FieldPassword/FieldPassword'
import { FieldRadioGroup } from '@/components/ui/FieldRadioGroup/FieldRadioGroup'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { FieldSwitch } from '@/components/ui/FieldSwitch/FieldSwitch'
import { FieldTextarea } from '@/components/ui/FieldTextarea/FieldTextarea'

const meta = {
  title: 'Pages/Fields',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

type ExampleValues = {
  date: string
  endDate: string
  email: string
  message: string
  notifications: boolean
  password: string
  plan: string
  quantity: number
  role: string
  startDate: string
  terms: boolean
}

function FieldsPage() {
  const { control } = useForm<ExampleValues>({
    defaultValues: {
      date: '',
      endDate: '',
      email: '',
      message: '',
      notifications: true,
      password: '',
      plan: 'starter',
      quantity: 1,
      role: '',
      startDate: '',
      terms: false,
    },
  })

  return (
    <Stack gap="8" maxW="4xl">
      <Stack gap="2">
        <Heading as="h1" size="2xl">
          Form fields
        </Heading>
        <Text color="fg.muted">
          Reusable React Hook Form controls with a consistent Chakra UI
          treatment.
        </Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        <FieldInput
          control={control}
          label="Email address"
          name="email"
          type="email"
        />
        <FieldInputNumber
          control={control}
          label="Quantity"
          min={1}
          name="quantity"
        />
        <FieldDatePicker control={control} label="Due date" name="date" />
        <FieldDatePickerInterval
          control={control}
          label="Project dates"
          endName="endDate"
          startName="startDate"
        />
        <FieldSelect
          control={control}
          label="Role"
          name="role"
          options={[
            { label: 'Administrator', value: 'administrator' },
            { label: 'Editor', value: 'editor' },
          ]}
          placeholder="Choose a role"
        />
        <FieldPassword control={control} label="Password" name="password" />
        <FieldTextarea control={control} label="Message" name="message" />
        <FieldRadioGroup
          control={control}
          label="Plan"
          name="plan"
          options={[
            { label: 'Starter', value: 'starter' },
            { label: 'Professional', value: 'professional' },
          ]}
        />
        <FieldCheckbox control={control} label="Accept terms" name="terms" />
        <FieldSwitch
          control={control}
          label="Email notifications"
          name="notifications"
        />
      </SimpleGrid>
    </Stack>
  )
}

export const Default: Story = {
  render: () => <FieldsPage />,
}
