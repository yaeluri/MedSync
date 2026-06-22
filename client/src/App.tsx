import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import VisitPage from './pages/VisitPage';
import DocumentsPage from './pages/DocumentsPage';
import PatientDashboard from './pages/PatientDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientsListPage from './pages/PatientsListPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/patients/:id/visits/:visitId" element={<VisitPage />} />
          <Route path="/patients/:id/documents" element={<DocumentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



