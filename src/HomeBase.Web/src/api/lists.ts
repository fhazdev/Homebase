import type {
  UserListDto,
  UserListDetailDto,
  ListItemDto,
  CreateUserListRequest,
  UpdateUserListRequest,
  CreateListItemRequest,
  UpdateListItemRequest,
} from '../types'
import { apiClient } from './client'

export const listsApi = {
  getAll: () =>
    apiClient.get<UserListDto[]>('/lists').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<UserListDetailDto>(`/lists/${id}`).then((r) => r.data),

  create: (data: CreateUserListRequest) =>
    apiClient.post<UserListDto>('/lists', data).then((r) => r.data),

  update: (id: string, data: UpdateUserListRequest) =>
    apiClient.put<UserListDto>(`/lists/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/lists/${id}`).then((r) => r.data),

  addItem: (listId: string, data: CreateListItemRequest) =>
    apiClient.post<ListItemDto>(`/lists/${listId}/items`, data).then((r) => r.data),

  updateItem: (listId: string, itemId: string, data: UpdateListItemRequest) =>
    apiClient.put<ListItemDto>(`/lists/${listId}/items/${itemId}`, data).then((r) => r.data),

  deleteItem: (listId: string, itemId: string) =>
    apiClient.delete(`/lists/${listId}/items/${itemId}`).then((r) => r.data),
}
