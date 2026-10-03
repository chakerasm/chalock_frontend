import { describe, expect, it } from 'vitest'
import {
  inferTaskImportMapping,
  makeTaskImportRows,
  taskImportPayload,
  validateTaskImportRow,
} from '@/features/goals/services/task-import.service'
import type { TaskImportRow } from '@/features/goals/types/task-import.types'

function row(overrides: Partial<TaskImportRow> = {}): TaskImportRow {
  return {
    description: '',
    dueDate: '',
    errors: [],
    estimatedMinutes: '',
    priority: '',
    rowId: 'row-1',
    selected: true,
    sourceRowIndex: 2,
    title: 'Build importer',
    warnings: [],
    ...overrides,
  }
}

describe('task import service', () => {
  it('maps case-insensitive spreadsheet aliases', () => {
    expect(inferTaskImportMapping(['Task Name', 'DETAILS', 'Duration (min)', 'Due']))
      .toEqual({ 'Task Name': 'title', DETAILS: 'description', 'Duration (min)': 'estimatedMinutes', Due: 'dueDate' })
  })

  it('validates imported task values with the regular task constraints', () => {
    expect(validateTaskImportRow(row({ priority: 'HIGH', estimatedMinutes: '60', dueDate: '2026-10-05' })).errors).toEqual([])
    expect(validateTaskImportRow(row({ priority: 'urgent', estimatedMinutes: '2h', dueDate: '03/04/2026' })).errors.length).toBeGreaterThan(0)
  })

  it('warns about repeated titles without blocking the rows', () => {
    const rows = makeTaskImportRows(['title'], [['Build importer'], ['Build importer']], { title: 'title' }, [])
    expect(rows.every((item) => item.warnings.some((warning) => warning.message.includes('duplicate')))).toBe(true)
  })

  it('creates an ordered payload only from selected valid rows', () => {
    expect(taskImportPayload([row({ title: 'First' }), row({ rowId: 'row-2', selected: false, title: 'Second' }), row({ rowId: 'row-3', errors: [{ field: 'title', message: 'Required' }], title: 'Third' })])).toEqual([{ title: 'First' }])
  })
})
