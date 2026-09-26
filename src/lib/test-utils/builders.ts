export function buildItemFromType<TItem extends object>(
  defaults: TItem,
  overrides: Partial<TItem> = {},
): TItem {
  return { ...defaults, ...overrides }
}

export function buildArrayItemFromType<TItem>(
  count: number,
  buildItem: (index: number) => TItem,
): TItem[] {
  return Array.from({ length: count }, (_, index) => buildItem(index))
}
