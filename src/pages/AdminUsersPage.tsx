import React, { useEffect, useState } from 'react';
import { usersApi } from '../api/users';
import type { User } from '../types/auth';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-xs text-gray-400 mt-0.5 opacity-80">
            Xem, tìm kiếm, và quản lý người dùng hiện tại.
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên/ email..."
          className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200 focus:border-[#ef5b1b] text-sm"
        />
        <div className="md:col-span-2 flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-sm"
          >
            Trang trước
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-sm"
          >
            Trang tiếp
          </button>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 bg-orange-50 border border-orange-200 text-[#ef5b1b] rounded-xl hover:bg-orange-100 text-sm font-semibold"
          >
            Làm mới bộ lọc
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 font-semibold text-gray-700 text-xs">
              <th className="px-3 py-2 border border-gray-100">#</th>
              <th className="px-3 py-2 border border-gray-100">Họ tên</th>
              <th className="px-3 py-2 border border-gray-100">Email</th>
              <th className="px-3 py-2 border border-gray-100">Điện thoại</th>
              <th className="px-3 py-2 border border-gray-100">Vai trò</th>
              <th className="px-3 py-2 border border-gray-100">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Không có người dùng
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border border-gray-100">
                    {idx + 1 + (page - 1) * size}
                  </td>
                  <td className="px-3 py-2 border border-gray-100">
                    {user.full_name || '-'}
                  </td>
                  <td className="px-3 py-2 border border-gray-100">
                    {user.email || '-'}
                  </td>
                  <td className="px-3 py-2 border border-gray-100">
                    {user.phone || '-'}
                  </td>
                  <td className="px-3 py-2 border border-gray-100">
                    {user.role || 'USER'}
                  </td>
                  <td className="px-3 py-2 border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs hover:bg-amber-100 border border-amber-100"
                      >
                        Cập nhật trạng thái
                      </button>
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100 border border-red-100"
                      >
                        Vô hiệu hóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Trang {page} (size: {size})
      </div>
    </div>
  );
};

export default AdminUsersPage;
