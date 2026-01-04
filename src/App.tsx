import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import CheckIn from '@/pages/CheckIn';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import Onboarding from '@/pages/Onboarding';
import DomainDetail from '@/pages/DomainDetail';
import GoalManager from '@/pages/GoalManager';
import DailyReportPage from '@/pages/DailyReportPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const queryClient = new QueryClient();




function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Login />
                  </ProtectedRoute>
                } />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Onboarding />
                  </ProtectedRoute>
                } />

                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="check-in" element={<CheckIn />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="goals" element={<GoalManager />} />
                  <Route path="report" element={<DailyReportPage />} />
                  <Route path=":domainId" element={<DomainDetail />} />
                  <Route path="settings" element={<Dashboard />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

