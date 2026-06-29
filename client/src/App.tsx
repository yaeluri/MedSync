import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import RequireRole from "./components/RequireRole";

const VisitPage            = lazy(() => import("./pages/VisitPage/VisitPage"));
const DocumentsPage        = lazy(() => import("./pages/DocumentsPage/DocumentsPage"));
const PatientDashboard     = lazy(() => import("./pages/PatientDashboard/PatientDashboard"));
const LoginPage            = lazy(() => import("./pages/LoginPage/LoginPage"));
const RegisterPage         = lazy(() => import("./pages/RegisterPage/RegisterPage"));
const RoleSelectPage       = lazy(() => import("./pages/RoleSelectPage/RoleSelectPage"));
const PatientsListPage     = lazy(() => import("./pages/PatientsListPage/PatientsListPage"));
const PatientDashboardPage = lazy(() => import("./pages/PatientDashboardPage/PatientDashboardPage"));
const ProfilePage          = lazy(() => import("./pages/ProfilePage/ProfilePage"));

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
            {/* Patient-only */}
            <Route element={<RequireRole allow={["patient"]} />}>
              <Route path="/dashboard" element={<PatientDashboard />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/visit"     element={<VisitPage />} />
            </Route>

            {/* Doctor-only */}
            <Route element={<RequireRole allow={["doctor"]} />}>
              <Route path="/patients"                     element={<PatientsListPage />} />
              <Route path="/patients/:id"                 element={<PatientDashboardPage />} />
              <Route path="/patients/:id/visit"           element={<VisitPage />} />
              <Route path="/patients/:id/visits/:visitId" element={<VisitPage />} />
              <Route path="/patients/:id/documents"       element={<DocumentsPage />} />
            </Route>

            {/* Any authenticated user */}
            <Route element={<RequireRole />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
