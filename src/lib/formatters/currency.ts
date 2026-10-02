export function formatCurrency(
  value: number,
  currency: string,
  locale?: string,
) {
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'decimal',
  }).format(value)} ${currency}`
}
