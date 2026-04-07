import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'
import { apiClient } from './client'

export const categoriesApi = {
  getAll: () =>
    apiClient.get<Category[]>('/categories').then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryRequest) =>
    apiClient.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string, reassignTo: string) =>
    apiClient.delete(`/categories/${id}`, { params: { reassignTo } }).then((r) => r.data),
}
