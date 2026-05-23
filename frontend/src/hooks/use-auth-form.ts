import { useRef, useState } from 'react'
import type { ZodType } from 'zod'

import { getFieldErrors } from '@/lib/form-errors'

export function getFormValue(form: HTMLFormElement, name: string): string {
  const element = form.elements.namedItem(name)

  if (element instanceof RadioNodeList) {
    return element.value
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value
  }

  return ''
}

type UseAuthFormOptions<T> = {
  schema: ZodType<T>
  onSubmit: (values: T) => Promise<void>
  getValues: (form: HTMLFormElement) => unknown
}

export function useAuthForm<T>({ schema, onSubmit, getValues }: UseAuthFormOptions<T>) {
  const formRef = useRef<HTMLFormElement>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)

    const form = formRef.current ?? event.currentTarget
    const parsed = schema.safeParse(getValues(form))

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      setFormError('Please fix the errors below.')
      return
    }

    void onSubmit(parsed.data).catch(() => {
      // API errors are handled by the auth store
    })
  }

  const clearFormErrors = () => {
    setFieldErrors({})
    setFormError(null)
  }

  return {
    formRef,
    fieldErrors,
    formError,
    handleSubmit,
    clearFormErrors,
    setFormError,
  }
}
