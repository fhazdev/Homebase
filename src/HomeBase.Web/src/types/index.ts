// ─── Enums ────────────────────────────────────────────────────────────────────

export enum RecurrenceUnit {
  Days = 0,
  Weeks = 1,
  Months = 2,
  Years = 3,
  Miles = 4,
}

export const RecurrenceUnitLabels: Record<RecurrenceUnit, string> = {
  [RecurrenceUnit.Days]: 'Days',
  [RecurrenceUnit.Weeks]: 'Weeks',
  [RecurrenceUnit.Months]: 'Months',
  [RecurrenceUnit.Years]: 'Years',
  [RecurrenceUnit.Miles]: 'Miles',
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  expiresAt: string // ISO date string
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  icon: string
  sortOrder: number
  taskCount: number
}

export interface CreateCategoryRequest {
  name: string
  icon?: string
}

export interface UpdateCategoryRequest {
  name?: string
  icon?: string
}

// ─── Completion Log ───────────────────────────────────────────────────────────

export interface CompletionLog {
  id: string
  completedAt: string // ISO date string
  notes?: string
  photoUrl?: string
}

export interface CompleteTaskRequest {
  completedAt?: string // ISO date string
  notes?: string
  photoUrl?: string
}

export interface UpdateCompletionRequest {
  completedAt?: string
  notes?: string
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface TaskDto {
  id: string
  name: string
  icon: string
  recurrenceValue?: number | null
  recurrenceUnit?: RecurrenceUnit | null
  isRecurring: boolean
  notes?: string
  firstDueDate?: string
  nextDueDate?: string
  isOverdue: boolean
  daysOverdue?: number
  categoryId: string
  categoryName?: string
  createdAt: string
  lastCompletion?: CompletionLog
}

export interface TaskDetailDto extends Omit<TaskDto, 'lastCompletion'> {
  completions: CompletionLog[]
}

export interface CreateTaskRequest {
  name: string
  icon?: string
  recurrenceValue?: number
  recurrenceUnit?: RecurrenceUnit
  notes?: string
  firstDueDate?: string
  categoryId: string
}

export interface UpdateTaskRequest {
  name?: string
  icon?: string
  recurrenceValue?: number
  recurrenceUnit?: RecurrenceUnit
  isRecurring?: boolean
  notes?: string
  firstDueDate?: string
  categoryId?: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface RecentCompletion {
  taskId: string
  taskName: string
  taskIcon: string
  completedAt: string // ISO date string
  notes?: string
}

export interface DashboardDto {
  overdueTasks: TaskDto[]
  upcomingTasks: TaskDto[]
  recentCompletions: RecentCompletion[]
}

// ─── Lists ───────────────────────────────────────────────────────────────────

export interface UserListDto {
  id: string
  name: string
  icon: string
  sortOrder: number
  itemCount: number
  completedCount: number
  createdAt: string
}

export interface UserListDetailDto {
  id: string
  name: string
  icon: string
  sortOrder: number
  createdAt: string
  items: ListItemDto[]
}

export interface ListItemDto {
  id: string
  title: string
  url?: string
  phone?: string
  details?: string
  isCompleted: boolean
  sortOrder: number
}

export interface CreateUserListRequest {
  name: string
  icon?: string
}

export interface UpdateUserListRequest {
  name?: string
  icon?: string
}

export interface CreateListItemRequest {
  title: string
  url?: string
  phone?: string
  details?: string
}

export interface UpdateListItemRequest {
  title?: string
  url?: string
  phone?: string
  details?: string
  isCompleted?: boolean
  sortOrder?: number
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message?: string
  errors?: string[]
}
