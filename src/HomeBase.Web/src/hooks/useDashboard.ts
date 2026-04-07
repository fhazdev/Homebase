import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'

export function useDashboard(days = 7) {
  return useQuery({
    queryKey: ['dashboard', { days }],
    queryFn: () => dashboardApi.get(days),
  })
}
