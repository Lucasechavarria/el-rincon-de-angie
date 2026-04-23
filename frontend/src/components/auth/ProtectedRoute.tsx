import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('access_token'); // Comprueba si existe el token

  if (!isAuthenticated) {
    // Si no está autenticado, redirige a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los hijos (o el Outlet si se usa como ruta padre)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
