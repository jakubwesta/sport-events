import type { ZodError } from 'zod'

export function getFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.')
    if (key && !result[key]) {
      result[key] = issue.message
    }
  }

  return result
}
