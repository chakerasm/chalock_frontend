type DateValue = string | null | undefined

export function mapDateToUI<TDate extends DateValue>(date: TDate): TDate {
  return date
}

export function mapDateToAPI<TDate extends DateValue>(date: TDate): TDate {
  return date
}
