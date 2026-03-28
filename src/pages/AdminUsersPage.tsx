import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { usersApi } from '../api/users';
import type { User } from '../types/auth';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const navigate = useNavigate();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const localUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const parsedUser = localUser ? (JSON.parse(localUser) as User) : null;

  const isAdmin = parsedUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (!token) return;

    const loadUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await usersApi.getUsers({ page, size, search: search || undefined });
        setUsers(data);
      } catch (err) {
        console.error('Failed load users', err);
        setError('Tải danh sách người dùng thất bại. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token, page, size, search]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa người dùng này không?')) {
      return;
    }

    try {
      setLoading(true);
      await usersApi.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Xoá người dùng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setLoading(true);
      await usersApi.toggleUserStatus(id);
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user } : user)));
    } catch (err) {
      console.error('Toggle status error:', err);
      setError('Cập nhật trạng thái thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
            <p className="text-sm text-slate-500">Xem, tìm kiếm, và quản lý người dùng hiện tại.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{parsedUser?.full_name} ({parsedUser?.role})</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên/ email..."
            className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
            >
              Trang tiếp
            </button>
            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 bg-orange-100 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-200"
            >
              Làm mới bộ lọc
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 font-semibold text-slate-700">
                <th className="px-3 py-2 border">#</th>
                <th className="px-3 py-2 border">Họ tên</th>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Điện thoại</th>
                <th className="px-3 py-2 border">Vai trò</th>
                <th className="px-3 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">Đang tải...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">Không có người dùng</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border">{idx + 1 + (page - 1) * size}</td>
                    <td className="px-3 py-2 border">{user.full_name || '-'}</td>
                    <td className="px-3 py-2 border">{user.email || '-'}</td>
                    <td className="px-3 py-2 border">{user.phone || '-'}</td>
                    <td className="px-3 py-2 border">{user.role || 'USER'}</td>
                    <td className="px-3 py-2 border flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs hover:bg-amber-200"
                      >
                        Cập nhật trạng thái
                      </button>
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200"
                      >
                        Vô hiệu hóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-slate-500">Trang {page} (size: {size})</div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
