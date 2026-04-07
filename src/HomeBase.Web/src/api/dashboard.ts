import type { DashboardDto } from '../types'
import { apiClient } from './client'

export const dashboardApi = {
  get: (days = 7) =>
    apiClient.get<DashboardDto>('/dashboard', { params: { days } }).then((r) => r.data),
}
