import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '../api/lists'
import type {
  CreateUserListRequest,
  UpdateUserListRequest,
  CreateListItemRequest,
  UpdateListItemRequest,
} from '../types'

export const LISTS_KEY = ['lists'] as const

export function useLists() {
  return useQuery({
    queryKey: LISTS_KEY,
    queryFn: () => listsApi.getAll(),
  })
}

export function useList(id: string) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => listsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserListRequest) => listsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
  })
}

export function useUpdateList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserListRequest }) =>
      listsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
  })
}

export function useDeleteList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: LISTS_KEY }),
  })
}

export function useAddListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: CreateListItemRequest }) =>
      listsApi.addItem(listId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['lists', variables.listId] })
      qc.invalidateQueries({ queryKey: LISTS_KEY })
    },
  })
}

export function useUpdateListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId, data }: { listId: string; itemId: string; data: UpdateListItemRequest }) =>
      listsApi.updateItem(listId, itemId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['lists', variables.listId] })
      qc.invalidateQueries({ queryKey: LISTS_KEY })
    },
  })
}

export function useDeleteListItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      listsApi.deleteItem(listId, itemId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['lists', variables.listId] })
      qc.invalidateQueries({ queryKey: LISTS_KEY })
    },
  })
}
