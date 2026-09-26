import { setupWorker } from 'msw/browser'
import { exampleFutureHandlers } from '@/features/example-future/api/example-future.handlers'

export const worker = setupWorker(...exampleFutureHandlers)
