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
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth>
              <AdminUsersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <RequireAuth>
              <MenuManagementPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAuth>
              <CategoryManagementPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <RequireAuth>
              <TableManagementPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
