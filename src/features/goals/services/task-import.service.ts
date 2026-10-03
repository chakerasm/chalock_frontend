import * as XLSX from 'xlsx'
import { createTaskInputSchema } from '@/features/tasks/schemas/tasks.schemas'
import type { Task } from '@/features/tasks/types/tasks.types'
import {
  taskImportFields,
  type TaskImportField,
  type TaskImportMapping,
  type TaskImportPayload,
  type TaskImportRow,
  type TaskImportValues,
} from '@/features/goals/types/task-import.types'

export const TASK_IMPORT_LIMIT = 500

export const taskImportConfig: Record<
  TaskImportField,
  { aliases: string[]; required?: boolean }
> = {
  title: { aliases: ['title', 'task', 'task name', 'name'], required: true },
  description: { aliases: ['description', 'details', 'notes', 'task description'] },
  priority: { aliases: ['priority'] },
  estimatedMinutes: {
    aliases: ['estimatedminutes', 'estimated minutes', 'estimate', 'duration', 'duration (min)', 'minutes'],
  },
  dueDate: { aliases: ['duedate', 'due date', 'deadline', 'due'] },
}

function normalizeHeader(value: unknown) {
  return String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function displayCell(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? '').trim()
}

export function inferTaskImportMapping(headers: string[]): TaskImportMapping {
  const mapping: TaskImportMapping = {}
  const mapped = new Set<TaskImportField>()
  for (const header of headers) {
    const normalized = normalizeHeader(header)
    const field = taskImportFields.find(
      (candidate) =>
        !mapped.has(candidate) &&
        taskImportConfig[candidate].aliases.includes(normalized),
    )
    if (field) {
      mapping[header] = field
      mapped.add(field)
    }
  }
  return mapping
}

export function needsTaskImportMapping(headers: string[], mapping: TaskImportMapping) {
  return !headers.some((header) => mapping[header] === 'title')
}

export async function parseTaskImportFile(file: File) {
  const extension = file.name.split('.').pop()?.toLocaleLowerCase()
  if (!['csv', 'xlsx', 'xls'].includes(extension ?? '')) {
    throw new Error("This file type isn't supported. Choose an XLSX or CSV file.")
  }
  if (!file.size) throw new Error('This file is empty.')

  const workbook = XLSX.read(await file.arrayBuffer(), {
    cellDates: true,
    cellFormula: false,
    cellText: false,
    type: 'array',
  })
  const sheet = workbook.Sheets[workbook.SheetNames[0] ?? '']
  if (!sheet) throw new Error("We couldn't read this file.")
  const values = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    blankrows: false,
    defval: '',
    header: 1,
    raw: true,
  })
  const [headerRow, ...dataRows] = values
  const headers = (headerRow ?? []).map(displayCell).filter(Boolean)
  if (!headers.length) throw new Error('This file is missing a header row.')
  if (!dataRows.length) throw new Error('No task rows were found.')
  if (dataRows.length > TASK_IMPORT_LIMIT) {
    throw new Error(`This file contains more than ${TASK_IMPORT_LIMIT} tasks.`)
  }
  return { headers, dataRows: dataRows.map((row) => row.map(displayCell)) }
}

export function makeTaskImportRows(
  headers: string[],
  dataRows: string[][],
  mapping: TaskImportMapping,
  existingTasks: Task[],
): TaskImportRow[] {
  const existingTitles = new Set(existingTasks.map((task) => normalizeTitle(task.title)))
  const counts = new Map<string, number>()
  const rawRows = dataRows.map((values, index) => {
    const row: TaskImportValues = { description: '', dueDate: '', estimatedMinutes: '', priority: '', title: '' }
    headers.forEach((header, headerIndex) => {
      const field = mapping[header]
      if (field && field !== 'ignore') row[field] = values[headerIndex] ?? ''
    })
    const title = normalizeTitle(row.title)
    if (title) counts.set(title, (counts.get(title) ?? 0) + 1)
    return { row, index, title }
  })
  return rawRows.map(({ row, index, title }) => validateTaskImportRow({
    ...row,
    rowId: `${index}-${crypto.randomUUID()}`,
    selected: true,
    sourceRowIndex: index + 2,
    errors: [],
    warnings: [
      ...(title && (counts.get(title) ?? 0) > 1 ? [{ message: 'Possible duplicate within this import.' }] : []),
      ...(title && existingTitles.has(title) ? [{ message: 'A task with this title already exists in this Goal.' }] : []),
    ],
  }))
}

export function validateTaskImportRow(row: TaskImportRow): TaskImportRow {
  const priority = row.priority.trim().toLocaleLowerCase()
  const estimatedMinutes = row.estimatedMinutes.trim()
  const candidate = {
    title: row.title.trim(),
    ...(row.description.trim() ? { description: row.description.trim() } : {}),
    ...(priority ? { priority } : {}),
    ...(estimatedMinutes ? { estimatedMinutes: Number(estimatedMinutes) } : {}),
    ...(row.dueDate.trim() ? { dueDate: row.dueDate.trim() } : {}),
  }
  const result = createTaskInputSchema.safeParse(candidate)
  const errors = result.success
    ? []
    : result.error.issues.map((issue) => ({
        field: (issue.path[0] || 'title') as TaskImportField,
        message: issue.message,
      }))
  if (estimatedMinutes && !/^\d+$/.test(estimatedMinutes)) {
    errors.push({ field: 'estimatedMinutes', message: 'Estimated minutes must be a positive integer.' })
  }
  return { ...row, priority, errors }
}

export function taskImportPayload(rows: TaskImportRow[]): TaskImportPayload[] {
  return rows
    .filter((row) => row.selected && row.errors.length === 0)
    .map((row) => ({
      title: row.title.trim(),
      ...(row.description.trim() ? { description: row.description.trim() } : {}),
      ...(row.priority ? { priority: row.priority as TaskImportPayload['priority'] } : {}),
      ...(row.estimatedMinutes ? { estimatedMinutes: Number(row.estimatedMinutes) } : {}),
      ...(row.dueDate.trim() ? { dueDate: row.dueDate.trim() } : {}),
    }))
}

export function buildTaskImportPrompt(goal: { title: string; description?: string; targetDate?: string }, compact = false) {
  const context = [`Break the following goal into actionable tasks:\n\n"${goal.title}"`]
  if (goal.description) context.push(`\nGoal context:\n\n"${goal.description}"`)
  if (goal.targetDate) context.push(`\nTarget completion date: ${goal.targetDate}`)
  const fields = 'title | description | priority | estimatedMinutes | dueDate'
  if (compact) return `${context.join('\n')}\n\nReturn an Excel-compatible table with EXACTLY these columns:\n\n${fields}\n\nRules:\n- priority: low | medium | high\n- estimatedMinutes: positive integer in minutes\n- dueDate: YYYY-MM-DD or empty\n- one row per task\n- no extra columns or text outside the table\n- preserve logical execution order`
  return `${context.join('\n')}\n\nReturn the result as an Excel-compatible table. Use EXACTLY these columns and column names:\n\n${fields}\n\nRules:\n- title is required, actionable, starts with a verb when possible, and is at most 120 characters\n- description is optional and brief\n- priority must be exactly low, medium, or high\n- estimatedMinutes must be a positive integer (for example 30, 60, or 120)\n- dueDate must be YYYY-MM-DD or empty; do not assign dates after the goal target date\n- one row represents exactly one task; preserve execution order\n- do not add, rename, or merge columns; do not add headings, IDs, goalId, status, timestamps, Markdown, or text outside the table\n\nThe first row must contain exactly:\n\n${fields}`
}

export const taskImportExampleCsv = `title,description,priority,estimatedMinutes,dueDate\nDefine MVP scope,Finalize the first release scope,high,60,2026-10-05\nBuild Tasks module,Implement task CRUD,high,180,2026-10-08\n`

function normalizeTitle(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}
