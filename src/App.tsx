import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import HistoryPage from './pages/HistoryPage'
import GoalsPage from './pages/GoalsPage'
import SettingsPage from './pages/SettingsPage'
import PromotionsPage from './pages/PromotionsPage'
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import { AuthProvider, useAuth } from './hooks/use-auth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/cadastro"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/objetivos" element={<GoalsPage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/promocoes" element={<PromotionsPage />} />
        <Route path="/admin/promocoes" element={<AdminPromotionsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
