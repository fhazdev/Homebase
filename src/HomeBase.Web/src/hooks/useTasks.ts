import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks'
import type {
  CompleteTaskRequest,
  CreateTaskRequest,
  UpdateCompletionRequest,
  UpdateTaskRequest,
} from '../types'

export const TASKS_KEY = ['tasks'] as const

export function useTasks(categoryId?: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, { categoryId }],
    queryFn: () => tasksApi.getAll(categoryId),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksApi.update(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, vars.id] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTaskRequest }) =>
      tasksApi.complete(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, vars.id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateCompletion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      logId,
      data,
    }: {
      taskId: string
      logId: string
      data: UpdateCompletionRequest
    }) => tasksApi.updateCompletion(taskId, logId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, vars.taskId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteCompletion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, logId }: { taskId: string; logId: string }) =>
      tasksApi.deleteCompletion(taskId, logId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, vars.taskId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
