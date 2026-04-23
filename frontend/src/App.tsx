/* eslint-disable import/first */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence as AnimatePresenceOriginal } from 'framer-motion';
const AnimatePresence = AnimatePresenceOriginal as any;
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InstallPrompt from './components/pwa/InstallPrompt';

// Lazy load heavy components
const AuthorPage = lazy(() => import('./pages/AuthorPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure').then(module => ({ default: module.PaymentFailure })));
const PaymentPending = lazy(() => import('./pages/PaymentPending').then(module => ({ default: module.PaymentPending })));
const EnhancedBookReader = lazy(() => import('./components/EnhancedBookReader').then(module => ({ default: module.EnhancedBookReader })));
const UnsubscribePage = lazy(() => import('./pages/UnsubscribePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="animate-spin text-[#1B4D3E]" size={48} />
  </div>
);

// Componente para manejar las transiciones de rutas
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // @ts-ignore - Framer Motion type definition issue with React 18
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Rutas públicas que usan el Layout principal */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="historias" element={<HomePage />} />
            <Route path="libros" element={<BooksPage />} />
            <Route path="autora" element={<AuthorPage />} />
            <Route path="perfil" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="mis-libros" element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Rutas de autenticación y administración */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/failure" element={<PaymentFailure />} />
          <Route path="/pending" element={<PaymentPending />} />

          {/* Ruta protegida para el panel de administración */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Newsletter unsubscribe route */}
          <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />

          {/* Ruta dinámica para el lector de libros */}
          <Route path="/read/:id" element={<EnhancedBookReader />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnimatedRoutes />
          <InstallPrompt />
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
