import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminLayout from './components/Admin/Layout';
import AdminUsersPage from './pages/AdminUsersPage';
import DashboardPage from './pages/Admin/DashboardPage';
import MenuManagementPage from './pages/Admin/MenuManagementPage';
import CategoryManagementPage from './pages/Admin/CategoryManagementPage';
import TableManagementPage from './pages/Admin/TableManagementPage';
import TableMapPage from './pages/Staff/TableMapPage';
import ActiveOrdersPage from './pages/Staff/ActiveOrdersPage';
import BillingPage from './pages/Staff/BillingPage';
import ProfilePage from './pages/ProfilePage';
import ChefLayout from './components/Chef/Layout';
import ChefDashboardPage from './pages/Chef/DashboardPage';
import ChefHistoryPage from './pages/Chef/HistoryPage';

function RequireStaff({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  let role = '';
  if (userRaw) {
    try {
      const parsed: unknown = JSON.parse(userRaw);
      role =
        parsed && typeof parsed === 'object' && 'role' in parsed
          ? String((parsed as Record<string, unknown>).role || '')
          : '';
    } catch {
      role = '';
    }
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role.toLowerCase() !== 'staff') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RequireChef({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  let role = '';
  let roleId: number | null = null;
  if (userRaw) {
    try {
      const parsed: unknown = JSON.parse(userRaw);
      role =
        parsed && typeof parsed === 'object' && 'role' in parsed
          ? String((parsed as Record<string, unknown>).role || '')
          : '';
      const parsedRoleId =
        parsed && typeof parsed === 'object' && 'role_id' in parsed
          ? (parsed as Record<string, unknown>).role_id
          : undefined;
      if (typeof parsedRoleId === 'number') {
        roleId = parsedRoleId;
      } else if (typeof parsedRoleId === 'string' && parsedRoleId.trim() !== '') {
        const n = Number(parsedRoleId);
        roleId = Number.isFinite(n) ? n : null;
      }
    } catch {
      role = '';
    }
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role.toLowerCase() !== 'chef' && roleId !== 4) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminLayout from './components/Admin/Layout';
import AdminUsersPage from './pages/AdminUsersPage';
import DashboardPage from './pages/Admin/DashboardPage';
import MenuManagementPage from './pages/Admin/MenuManagementPage';
import CategoryManagementPage from './pages/Admin/CategoryManagementPage';
import TableManagementPage from './pages/Admin/TableManagementPage';
import LoyaltyManagementPage from './pages/Admin/LoyaltyManagementPage';
import VoucherManagementPage from './pages/Admin/VoucherManagementPage';
import TableMapPage from './pages/Staff/TableMapPage';
import ActiveOrdersPage from './pages/Staff/ActiveOrdersPage';
import BillingPage from './pages/Staff/BillingPage';
import ChefLayout from './components/Chef/Layout';
import ChefDashboardPage from './pages/Chef/DashboardPage';
import ChefHistoryPage from './pages/Chef/HistoryPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  let role = '';
  if (userRaw) {
    try {
      const parsed: unknown = JSON.parse(userRaw);
      role =
        parsed && typeof parsed === 'object' && 'role' in parsed
          ? String((parsed as Record<string, unknown>).role || '')
          : '';
    } catch {
      role = '';
    }
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role.toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RequireChef({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  let role = '';
  if (userRaw) {
    try {
      const parsed: unknown = JSON.parse(userRaw);
      role =
        parsed && typeof parsed === 'object' && 'role' in parsed
          ? String((parsed as Record<string, unknown>).role || '')
          : '';
    } catch {
      role = '';
    }
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role.toLowerCase() !== 'chef') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="vouchers" element={<VoucherManagementPage />} />
          <Route path="loyalty" element={<LoyaltyManagementPage />} />
          <Route path="reports" element={<DashboardPage />} />
          <Route path="settings" element={<ProfilePage />} />
        </Route>
        <Route
          path="/chef"
          element={
            <RequireChef>
              <ChefLayout />
            </RequireChef>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ChefDashboardPage />} />
          <Route path="history" element={<ChefHistoryPage />} />
          <Route path="settings" element={<ProfilePage />} />
        </Route>
        <Route
          path="/staff/table-map"
          element={
            <RequireStaff>
              <TableMapPage />
            </RequireStaff>
          }
        />
        <Route
          path="/staff/active-orders"
          element={
            <RequireStaff>
              <ActiveOrdersPage />
            </RequireStaff>
          }
        />
        <Route
          path="/staff/billing"
          element={
            <RequireStaff>
              <BillingPage />
            </RequireStaff>
          }
        />
        <Route
          path="/staff/settings"
          element={
            <RequireStaff>
              <ProfilePage />
            </RequireStaff>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
