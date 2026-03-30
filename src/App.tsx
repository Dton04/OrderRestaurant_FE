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
import ServePage from './pages/ServePage';
import TableMenuPage from './pages/TableMenuPage';
import CheckoutPage from './pages/CheckoutPage';

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
          path="/serve"
          element={
            <RequireAuth>
              <ServePage />
            </RequireAuth>
          }
        />
        
        <Route
          path="/table-menu"
          element={
            <RequireAuth>
              <TableMenuPage />
            </RequireAuth>
          }
        />

        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />

        {/* Admin Routes */}
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
          <Route path="reports" element={<DashboardPage />} />
          <Route path="settings" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
