import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../utils/authSession';
import { AppShell } from './AppShell';

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default ProtectedRoute;
