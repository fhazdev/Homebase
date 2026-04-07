import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useInitAuth } from './hooks/useInitAuth'
import { useAuthStore } from './stores/authStore'
import { BottomNav } from './components/BottomNav'
import { FullPageSpinner } from './components/Spinner'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SettingsPage } from './pages/SettingsPage'
import { ListsPage } from './pages/ListsPage'
import { ListDetailPage } from './pages/ListDetailPage'
import { useState, useEffect } from 'react'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-ground">
      <main className="mx-auto max-w-lg px-[18px] pt-4 pb-[100px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function GuestRoute() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore()
  const [ready, setReady] = useState(false)

  useInitAuth()

  // Give the silent refresh a moment to complete on first load
  useEffect(() => {
    if (!isAuthenticated) {
      setReady(true)
      return
    }
    const timer = setTimeout(() => setReady(true), 500)
    return () => clearTimeout(timer)
  }, [isAuthenticated])

  if (!ready && isAuthenticated) return <FullPageSpinner />

  return (
    <Routes>
      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes with nav layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:id" element={<ListDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
