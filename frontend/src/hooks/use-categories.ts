import { categoriesApi } from '@/api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type { CategoryCreate } from '@/schemas'

export function useCategories() {
  return useAsync(() => categoriesApi.list(), [])
}

export function useCategory(categoryId: number | null) {
  return useAsync(
    () => {
      if (categoryId == null) return Promise.reject(new Error('Missing category id'))
      return categoriesApi.getById(categoryId)
    },
    [categoryId],
    { enabled: categoryId != null },
  )
}

export function useCategoryMutations() {
  const createMutation = useMutation((data: CategoryCreate) => categoriesApi.create(data))
  const deleteMutation = useMutation((categoryId: number) => categoriesApi.remove(categoryId))

  return {
    createCategory: createMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    createError: createMutation.error,
    deleteError: deleteMutation.error,
  }
}
