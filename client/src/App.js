import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const VisitPage = lazy(() => import('./pages/VisitPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/visit" element={<VisitPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/" element={<Navigate to="/documents" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
