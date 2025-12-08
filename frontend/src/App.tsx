import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { TestAttemptsPage } from './pages/TestAttemptsPage';
import { TestDetailPage } from './pages/TestDetailPage';
import { TestAttemptDetailPage } from './pages/TestAttemptDetailPage';
import { ExamPage } from './pages/ExamPage';
import { AdminPage } from './pages/AdminPage';
import './i18n/config'; 

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />     

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

         <Route
          path="/tests/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TestAttemptsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tests/:id/sections"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TestDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/testAttempts/:testAttemptId" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <TestAttemptDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Exam Route - No MainLayout, uses ExamLayout internally */}
        <Route
          path="/sectionAttempts/:sectionAttemptId"  
          element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          }
        />       


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
