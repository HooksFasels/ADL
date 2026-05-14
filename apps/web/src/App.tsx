import { useEffect, type ReactElement } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useBusStore } from './store/useBusStore';
import { realtime } from './services/realtime';
import { startSimulation } from './services/mock';
import PassengerDashboard from './features/passenger/PassengerDashboard';
import DriverDashboard from './features/driver/DriverDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import TransitAdminDashboard from './features/transit-admin/TransitAdminDashboard';
import LoginPage from './features/auth/LoginPage';
import { Button } from '@repo/utils/ui';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { UserRole } from './store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const useMock = import.meta.env.VITE_USE_MOCK === 'true';
    if (useMock) {
      startSimulation((update) => {
        useBusStore.getState().updateLocation(update);
      });
    } else {
      realtime.connect();
    }
    return () => realtime.disconnect();
  }, []);

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">ADL Transport</h1>
        <div className="flex items-center gap-4">
          {!isAuthenticated && !isLoginPage && (
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-blue-700">Login</Button>
            </Link>
          )}
          {isAuthenticated && user && (
            <>
              {user.role !== 'PASSENGER' && (
                <div className="flex flex-col items-end leading-none mr-2">
                  <span className="text-sm font-bold text-white">
                    {user.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-blue-200">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              )}
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 text-sm font-bold tracking-wide"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 h-full">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/passenger"
              element={
                <ProtectedRoute allowedRoles={['PASSENGER']}>
                  <PassengerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transit-admin"
              element={
                <ProtectedRoute allowedRoles={['TRANSIT_ADMIN']}>
                  <TransitAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
