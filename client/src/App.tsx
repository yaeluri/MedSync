import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

const VisitPage = lazy(() => import('./pages/VisitPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

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
            <Route path="/visit" element={<VisitPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;



