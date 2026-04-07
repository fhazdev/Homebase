import type {
  CompleteTaskRequest,
  CompletionLog,
  CreateTaskRequest,
  TaskDetailDto,
  TaskDto,
  UpdateCompletionRequest,
  UpdateTaskRequest,
} from '../types'
import { apiClient } from './client'

export const tasksApi = {
  getAll: (categoryId?: string) =>
    apiClient
      .get<TaskDto[]>('/tasks', { params: categoryId ? { categoryId } : undefined })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<TaskDetailDto>(`/tasks/${id}`).then((r) => r.data),

  create: (data: CreateTaskRequest) =>
    apiClient.post<TaskDto>('/tasks', data).then((r) => r.data),

  update: (id: string, data: UpdateTaskRequest) =>
    apiClient.put<TaskDto>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`).then((r) => r.data),

  complete: (id: string, data: CompleteTaskRequest) =>
    apiClient.post<CompletionLog>(`/tasks/${id}/complete`, data).then((r) => r.data),

  updateCompletion: (id: string, logId: string, data: UpdateCompletionRequest) =>
    apiClient.put<CompletionLog>(`/tasks/${id}/completions/${logId}`, data).then((r) => r.data),

  deleteCompletion: (id: string, logId: string) =>
    apiClient.delete(`/tasks/${id}/completions/${logId}`).then((r) => r.data),
}
