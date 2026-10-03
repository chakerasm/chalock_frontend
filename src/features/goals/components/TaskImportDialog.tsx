import {
  Badge,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { Copy, Download, FileUp, Pencil, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useBulkCreateGoalTasks } from '@/features/tasks/hooks/use-tasks'
import { isBulkTaskValidationError } from '@/features/tasks/api/tasks.api'
import type { Goal } from '@/features/goals/types/goals.types'
import {
  buildTaskImportPrompt,
  inferTaskImportMapping,
  makeTaskImportRows,
  needsTaskImportMapping,
  parseTaskImportFile,
  taskImportExampleCsv,
  TASK_IMPORT_LIMIT,
  taskImportPayload,
  validateTaskImportRow,
} from '@/features/goals/services/task-import.service'
import { taskImportFields, type TaskImportField, type TaskImportMapping, type TaskImportRow } from '@/features/goals/types/task-import.types'
import type { Task } from '@/features/tasks/types/tasks.types'

type ParsedFile = { dataRows: string[][]; headers: string[] }
type Step = 'upload' | 'mapping' | 'preview'

export function TaskImportDialog({ goal, open, onOpenChange, tasks }: { goal: Goal; open: boolean; onOpenChange: (open: boolean) => void; tasks: Task[] }) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const mutation = useBulkCreateGoalTasks()
  const [step, setStep] = useState<Step>('upload')
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<TaskImportMapping>({})
  const [rows, setRows] = useState<TaskImportRow[]>([])
  const [error, setError] = useState('')
  const [isReading, setIsReading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [compactPrompt, setCompactPrompt] = useState(false)

  const selectedRows = rows.filter((row) => row.selected)
  const validRows = selectedRows.filter((row) => row.errors.length === 0)
  const hasInvalidSelectedRows = selectedRows.some((row) => row.errors.length > 0)

  function reset() {
    setStep('upload'); setParsed(null); setMapping({}); setRows([]); setError(''); setShowPrompt(false)
  }
  function close() { reset(); onOpenChange(false) }
  function prepareRows(nextParsed: ParsedFile, nextMapping: TaskImportMapping) {
    setRows(makeTaskImportRows(nextParsed.headers, nextParsed.dataRows, nextMapping, tasks))
  }
  async function readFile(file?: File) {
    if (!file) return
    setIsReading(true); setError('')
    try {
      const nextParsed = await parseTaskImportFile(file)
      const nextMapping = inferTaskImportMapping(nextParsed.headers)
      setParsed(nextParsed); setMapping(nextMapping)
      if (needsTaskImportMapping(nextParsed.headers, nextMapping)) setStep('mapping')
      else { prepareRows(nextParsed, nextMapping); setStep('preview') }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't read this file.") }
    finally { setIsReading(false) }
  }
  function updateRow(rowId: string, values: Partial<TaskImportRow>) {
    setRows((current) => current.map((row) => row.rowId === rowId ? validateTaskImportRow({ ...row, ...values }) : row))
  }
  function copyPrompt() {
    void navigator.clipboard.writeText(buildTaskImportPrompt(goal, compactPrompt)).then(
      () => toast.success({ title: 'Prompt copied' }),
      () => toast.error({ title: 'Could not copy the prompt.' }),
    )
  }
  function downloadExample() {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([taskImportExampleCsv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'task-import-example.csv'; link.click(); URL.revokeObjectURL(link.href)
  }
  function submit() {
    mutation.mutate({ goalId: goal.id, tasks: taskImportPayload(rows) }, {
      onError: (caught) => {
        if (isBulkTaskValidationError(caught)) {
          const submittedRowIds = rows
            .filter((row) => row.selected && row.errors.length === 0)
            .map((row) => row.rowId)
          setRows((current) => current.map((row) => {
            const issues = caught.body.errors.filter(
              (issue) => submittedRowIds[issue.index] === row.rowId,
            )
            return issues.length
              ? { ...row, errors: issues.map((issue) => ({ field: (issue.field ?? 'title') as TaskImportField, message: issue.message })), selected: true }
              : row
          }))
          setError('Some tasks need attention before they can be imported.')
          return
        }
        setError('We could not import these tasks. Your preview is still available to retry.')
      },
      onSuccess: () => { toast.success({ title: `${validRows.length} tasks added to “${goal.title}”` }); close() },
    })
  }

  return <Dialog.Root open={open} onOpenChange={(details) => !details.open ? close() : onOpenChange(true)} size="xl">
    <Portal><Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxH="calc(100dvh - 2rem)">
      <Dialog.Header><Stack gap="1"><Dialog.Title>Import tasks</Dialog.Title><Dialog.Description>Import tasks into <strong>{goal.title}</strong></Dialog.Description></Stack><Dialog.CloseTrigger asChild><CloseButton aria-label={t('common.close')} size="sm" /></Dialog.CloseTrigger></Dialog.Header>
      <Dialog.Body overflowY="auto">
        <Stack gap="5">
          <HStack aria-label="Import progress" gap="2"><StepBadge active={step === 'upload'} label="1. Upload" /><StepBadge active={step === 'mapping'} label="2. Map" /><StepBadge active={step === 'preview'} label="3. Review" /></HStack>
          {error ? <Box aria-live="polite" bg="danger.subtle" color="danger.fg" p="3" rounded="l1">{error}</Box> : null}
          {step === 'upload' ? <Stack gap="4">
            <Box borderColor="border.emphasized" borderStyle="dashed" borderWidth="1px" cursor="pointer" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void readFile(event.dataTransfer.files[0]) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click() } }} p={{ base: '6', md: '10' }} rounded="l2" role="button" tabIndex={0} textAlign="center">
              <Stack align="center" gap="2"><FileUp aria-hidden="true" size={28} /><Text fontWeight="semibold">{isReading ? 'Reading file…' : 'Drop an Excel or CSV file here'}</Text><Text color="fg.muted" fontSize="sm">XLSX, CSV · Maximum {TASK_IMPORT_LIMIT} tasks</Text><Button as="span" size="sm" variant="outline"><Upload aria-hidden="true" size={15} />Choose file</Button></Stack>
            </Box>
            <input accept=".csv,.xlsx,.xls" aria-label="Choose task import file" hidden onChange={(event) => void readFile(event.target.files?.[0])} ref={inputRef} type="file" />
            <Box bg="bg.subtle" p="4" rounded="l2"><Stack gap="3"><HStack justify="space-between"><Stack gap="0"><Text fontWeight="semibold">Generating your plan with AI?</Text><Text color="fg.muted" fontSize="sm">Use a compatible table, then upload it here.</Text></Stack><Button onClick={() => setShowPrompt(!showPrompt)} size="sm" variant="ghost">{showPrompt ? 'Hide prompt' : 'View prompt'}</Button></HStack>
              {showPrompt ? <Stack gap="3"><HStack><Button onClick={() => setCompactPrompt(false)} size="xs" variant={compactPrompt ? 'ghost' : 'subtle'}>Detailed</Button><Button onClick={() => setCompactPrompt(true)} size="xs" variant={compactPrompt ? 'subtle' : 'ghost'}>Short</Button><Button ml="auto" onClick={copyPrompt} size="xs"><Copy aria-hidden="true" size={14} />Copy prompt</Button></HStack><Textarea aria-label="AI task generation prompt" readOnly rows={11} value={buildTaskImportPrompt(goal, compactPrompt)} /><Text color="fg.muted" fontSize="xs">Priority: low, medium, high · estimatedMinutes: positive integer · dueDate: YYYY-MM-DD</Text></Stack> : null}
              <Button alignSelf="start" onClick={downloadExample} size="sm" variant="outline"><Download aria-hidden="true" size={15} />Download example CSV</Button>
            </Stack></Box>
          </Stack> : null}
          {step === 'mapping' && parsed ? <Stack gap="4"><Text color="fg.muted">Choose the spreadsheet column for each task field. A title column is required.</Text>{parsed.headers.map((header) => <Flex align="center" gap="3" key={header}><Text flex="1" fontWeight="medium">{header}</Text><NativeSelect.Root maxW="13rem"><NativeSelect.Field aria-label={`Map ${header}`} onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value as TaskImportField | 'ignore' }))} value={mapping[header] ?? 'ignore'}><option value="ignore">Ignore</option>{taskImportFields.map((field) => <option disabled={Object.entries(mapping).some(([source, mapped]) => source !== header && mapped === field)} key={field} value={field}>{field}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Flex>)}<Button alignSelf="end" colorPalette="brand" disabled={!parsed.headers.some((header) => mapping[header] === 'title')} onClick={() => { prepareRows(parsed, mapping); setStep('preview') }}>Review tasks</Button></Stack> : null}
          {step === 'preview' ? <Stack gap="4"><Flex align="center" justify="space-between" wrap="wrap" gap="2"><Stack gap="0"><Text fontWeight="semibold">{rows.length} rows detected</Text><Text color="fg.muted" fontSize="sm">{validRows.length} ready · {selectedRows.filter((row) => row.errors.length > 0).length} need attention · {rows.length - selectedRows.length} excluded</Text></Stack><HStack><Button onClick={() => setRows((current) => current.map((row) => ({ ...row, selected: true })))} size="xs" variant="ghost">Select all</Button><Button onClick={() => setRows((current) => current.map((row) => ({ ...row, selected: false })))} size="xs" variant="ghost">Deselect all</Button></HStack></Flex>
            {rows.map((row) => <ImportRow key={row.rowId} row={row} onChange={updateRow} onRemove={() => setRows((current) => current.filter((item) => item.rowId !== row.rowId))} />)}
          </Stack> : null}
        </Stack>
      </Dialog.Body>
      <Dialog.Footer><Button onClick={step === 'upload' ? close : () => step === 'mapping' ? setStep('upload') : setStep('upload')} variant="outline">{step === 'upload' ? 'Cancel' : 'Start over'}</Button>{step === 'preview' ? <Button colorPalette="brand" disabled={!validRows.length || hasInvalidSelectedRows} loading={mutation.isPending} onClick={submit}>Import {validRows.length} tasks</Button> : null}</Dialog.Footer>
    </Dialog.Content></Dialog.Positioner></Portal>
  </Dialog.Root>
}

function StepBadge({ active, label }: { active: boolean; label: string }) { return <Badge colorPalette={active ? 'brand' : 'gray'} variant={active ? 'solid' : 'subtle'}>{label}</Badge> }

function ImportRow({ row, onChange, onRemove }: { row: TaskImportRow; onChange: (id: string, values: Partial<TaskImportRow>) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(row.errors.length > 0)
  return <Box borderColor={row.errors.length ? 'danger.border' : 'border.subtle'} borderWidth="1px" p="3" rounded="l1"><Stack gap="2"><Flex align="start" gap="3"><Checkbox.Root checked={row.selected} onCheckedChange={(details) => onChange(row.rowId, { selected: Boolean(details.checked) })}><Checkbox.HiddenInput /><Checkbox.Control /><Checkbox.Label srOnly>Select {row.title || `row ${row.sourceRowIndex}`}</Checkbox.Label></Checkbox.Root><Stack flex="1" gap="1" minW="0"><Text fontWeight="semibold">{row.title || 'Untitled task'}</Text>{row.description ? <Text color="fg.muted" fontSize="sm">{row.description}</Text> : null}<HStack gap="2" wrap="wrap">{row.priority ? <Badge variant="subtle">{row.priority}</Badge> : null}{row.estimatedMinutes ? <Text color="fg.muted" fontSize="xs">{row.estimatedMinutes} min</Text> : null}{row.dueDate ? <Text color="fg.muted" fontSize="xs">{row.dueDate}</Text> : null}</HStack></Stack><IconButton aria-label="Edit task" onClick={() => setEditing(!editing)} size="xs" variant="ghost"><Pencil aria-hidden="true" size={15} /></IconButton><IconButton aria-label="Remove task" colorPalette="danger" onClick={onRemove} size="xs" variant="ghost"><Trash2 aria-hidden="true" size={15} /></IconButton></Flex>
    {row.errors.map((item) => <Text color="danger.fg" fontSize="xs" key={`${item.field}-${item.message}`}>{item.message}</Text>)}{row.warnings.map((item) => <Text color="warning.fg" fontSize="xs" key={item.message}>{item.message}</Text>)}
    {editing ? <Stack gap="2"><Field.Root required invalid={row.errors.some((error) => error.field === 'title')}><Field.Label>Title</Field.Label><Input onChange={(event) => onChange(row.rowId, { title: event.target.value })} value={row.title} /></Field.Root><Field.Root><Field.Label>Description</Field.Label><Input onChange={(event) => onChange(row.rowId, { description: event.target.value })} value={row.description} /></Field.Root><HStack align="end"><Field.Root><Field.Label>Priority</Field.Label><NativeSelect.Root><NativeSelect.Field onChange={(event) => onChange(row.rowId, { priority: event.target.value })} value={row.priority}><option value="">Default</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root><Field.Root><Field.Label>Minutes</Field.Label><Input inputMode="numeric" onChange={(event) => onChange(row.rowId, { estimatedMinutes: event.target.value })} value={row.estimatedMinutes} /></Field.Root><Field.Root><Field.Label>Due date</Field.Label><Input onChange={(event) => onChange(row.rowId, { dueDate: event.target.value })} type="date" value={row.dueDate} /></Field.Root></HStack></Stack> : null}</Stack></Box>
}
