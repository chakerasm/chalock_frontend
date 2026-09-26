import {
  Code,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
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

export const Route = createFileRoute('/fields')({ component: FieldsPage })

type FieldDemoValues = {
  age?: number
  availabilityEnd: string
  availabilityStart: string
  biography: string
  dateOfBirth: string
  notifications: boolean
  password: string
  plan: string
  role: string
  termsAccepted: boolean
  userName: string
}

function FieldsPage() {
  const { control } = useForm<FieldDemoValues>({
    defaultValues: {
      age: 18,
      availabilityEnd: '',
      availabilityStart: '',
      biography: '',
      dateOfBirth: '',
      notifications: false,
      password: '',
      plan: 'starter',
      role: '',
      termsAccepted: false,
      userName: '',
    },
  })
  const values = useWatch({ control })

  return (
    <Container maxW="5xl" py={{ base: '10', md: '16' }}>
      <Stack gap="8">
        <Stack gap="2">
          <Heading as="h1" size="2xl">
            Form field test harness
          </Heading>
          <Text color="fg.muted">
            Browser coverage for the reusable React Hook Form and Chakra field
            components.
          </Text>
        </Stack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          <FieldInput
            control={control}
            description="Use a descriptive value."
            label="User name"
            name="userName"
            placeholder="Ada Lovelace"
            required
          />
          <FieldInputNumber
            control={control}
            label="Age"
            max={120}
            min={0}
            name="age"
          />
          <FieldDatePicker
            control={control}
            disabledFuture
            label="Date of birth"
            name="dateOfBirth"
          />
          <FieldDatePickerInterval
            control={control}
            disabledFuture
            label="Availability"
            endName="availabilityEnd"
            startName="availabilityStart"
          />
          <FieldSelect
            control={control}
            label="Role"
            name="role"
            options={[
              { label: 'Administrator', value: 'admin' },
              { label: 'Editor', value: 'editor' },
              { label: 'Viewer', value: 'viewer' },
            ]}
            placeholder="Choose a role"
          />
          <FieldPassword
            control={control}
            label="Password"
            name="password"
            placeholder="Enter a password"
          />
          <FieldTextarea
            control={control}
            label="Biography"
            name="biography"
            placeholder="Tell us about yourself"
          />
          <FieldRadioGroup
            control={control}
            label="Plan"
            name="plan"
            options={[
              { label: 'Starter', value: 'starter' },
              { label: 'Professional', value: 'professional' },
            ]}
          />
          <FieldCheckbox
            control={control}
            label="Accept terms"
            name="termsAccepted"
          />
          <FieldSwitch
            control={control}
            label="Email notifications"
            name="notifications"
          />
        </SimpleGrid>
        <Code
          aria-live="polite"
          data-testid="form-values"
          p="3"
          whiteSpace="pre-wrap"
        >
          {JSON.stringify(values)}
        </Code>
      </Stack>
    </Container>
  )
}
