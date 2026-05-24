import type { AxiosError } from 'axios'
import { z, type ZodError } from 'zod'

export class ApiError extends Error {
  readonly status: number
  readonly detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

const validationErrorSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
  type: z.string(),
})

const errorDetailSchema = z.union([
  z.string(),
  z.array(validationErrorSchema),
])

function formatDetail(detail: z.infer<typeof errorDetailSchema>): string {
  if (typeof detail === 'string') return detail
  return detail.map((item) => item.msg).join(', ')
}

export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isZodError(error)) {
    const detail = error.issues.map((issue) => issue.message).join(', ')
    return new ApiError(0, detail || 'Invalid response from server')
  }

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data

    if (data && typeof data === 'object' && 'detail' in data) {
      const parsed = errorDetailSchema.safeParse(data.detail)
      if (parsed.success) {
        return new ApiError(status, formatDetail(parsed.data))
      }
    }

    return new ApiError(status, error.message || 'Request failed')
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message)
  }

  return new ApiError(0, 'Unknown error')
}

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error
}

function isZodError(error: unknown): error is ZodError {
  return error instanceof z.ZodError
}

export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data)
}

export function parseResponseArray<T>(schema: z.ZodType<T>, data: unknown): T[] {
  return z.array(schema).parse(data)
}
