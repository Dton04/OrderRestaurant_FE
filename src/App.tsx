import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { MainLayout } from './components/Layout/MainLayout';
import AdminLayout from './components/Admin/Layout';
import DashboardPage from './pages/Admin/DashboardPage';
import MenuManagementPage from './pages/Admin/MenuManagementPage';
import CategoryManagementPage from './pages/Admin/CategoryManagementPage';
import TableManagementPage from './pages/Admin/TableManagementPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          {/* Placeholders for other admin pages */}
          <Route path="orders" element={<div className="p-8 text-center text-gray-400">Order Management Coming Soon</div>} />
          <Route path="staff" element={<div className="p-8 text-center text-gray-400">Staff Management Coming Soon</div>} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/home" element={<div>Home Page Content</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
