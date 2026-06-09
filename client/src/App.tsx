import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

const VisitPage = lazy(() => import('./pages/VisitPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PatientsListPage = lazy(() => import('./pages/PatientsListPage'));
const PatientDashboardPage = lazy(() => import('./pages/PatientDashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/visit" element={<VisitPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/patients" element={<PatientsListPage />} />
            <Route path="/patients/:id" element={<PatientDashboardPage />} />
            <Route path="/patients/:id/visit" element={<VisitPage />} />
            <Route path="/patients/:id/documents" element={<DocumentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;



