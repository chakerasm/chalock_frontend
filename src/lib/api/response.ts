export type ResponseSchema<T> = {
  parse: (value: unknown) => T
}

function omitNullObjectFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(omitNullObjectFields)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nestedValue]) =>
      nestedValue === null ? [] : [[key, omitNullObjectFields(nestedValue)]],
    ),
  )
}

/**
 * Validates backend JSON while accepting `null` for fields modelled as optional
 * in frontend domain types. Explicitly nullable response shapes still pass on
 * the first attempt; malformed data keeps its original validation error.
 */
export function parseApiData<T>(schema: ResponseSchema<T>, value: unknown): T {
  try {
    return schema.parse(value)
  } catch (originalError) {
    const normalizedValue = omitNullObjectFields(value)
    try {
      return schema.parse(normalizedValue)
    } catch {
      throw originalError
    }
  }
}

export async function parseApiJson<T>(
  response: Response | Promise<Response>,
  schema: ResponseSchema<T>,
): Promise<T> {
  return parseApiData(schema, await (await response).json())
}
