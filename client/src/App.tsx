import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

const VisitPage            = lazy(() => import("./pages/VisitPage"));
const DocumentsPage        = lazy(() => import("./pages/DocumentsPage"));
const PatientDashboard     = lazy(() => import("./pages/PatientDashboard"));
const LoginPage            = lazy(() => import("./pages/LoginPage"));
const RegisterPage         = lazy(() => import("./pages/RegisterPage"));
const RoleSelectPage       = lazy(() => import("./pages/RoleSelectPage"));
const PatientsListPage     = lazy(() => import("./pages/PatientsListPage"));
const PatientDashboardPage = lazy(() => import("./pages/PatientDashboardPage"));
const ProfilePage          = lazy(() => import("./pages/ProfilePage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "2rem" }}>Loading...</div>}>
        <Routes>
          <Route path="/login"    element={<RoleSelectPage />} />
          <Route path="/register" element={<RoleSelectPage />} />

          <Route path="/login/:role" element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
          </Route>
          <Route path="/register/:role" element={<AuthLayout />}>
            <Route index element={<RegisterPage />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path="/dashboard"                    element={<PatientDashboard />} />
            <Route path="/visit"                        element={<VisitPage />} />
            <Route path="/documents"                    element={<DocumentsPage />} />
            <Route path="/patients"                     element={<PatientsListPage />} />
            <Route path="/patients/:id"                 element={<PatientDashboardPage />} />
            <Route path="/patients/:id/visit"           element={<VisitPage />} />
            <Route path="/patients/:id/visits/:visitId" element={<VisitPage />} />
            <Route path="/patients/:id/documents"       element={<DocumentsPage />} />
            <Route path="/profile"                      element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
