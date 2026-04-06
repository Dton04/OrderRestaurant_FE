import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usersApi } from '../api/users';
import type { User } from '../types/auth';

interface Role {
  id: string;
  name: string;
  description?: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role_id: '2' // Default to STAFF
  });
  const [newRoleId, setNewRoleId] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [usersData, rolesData] = await Promise.all([
        usersApi.getUsers({ page, size, search: search || undefined }),
        usersApi.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed load administration data', err);
      setError('Tải dữ liệu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, page, size, search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await usersApi.createUser(newUser);
      setSuccess('Thêm người dùng mới thành công!');
      setShowAddModal(false);
      setNewUser({ full_name: '', email: '', password: '', phone: '', role_id: '2' });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRoleId) return;
    setSubmitting(true);
    setError('');
    try {
      await usersApi.updateUserRole(selectedUser.id, newRoleId);
      setSuccess('Cập nhật vai trò thành công!');
      setShowRoleModal(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vai trò.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa người dùng này không?')) return;
    try {
      setLoading(true);
      await usersApi.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setSuccess('Đã vô hiệu hóa người dùng.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Xoá người dùng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setLoading(true);
      await usersApi.toggleUserStatus(id);
      loadData();
      setSuccess('Trạng thái đã được cập nhật.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Cập nhật trạng thái thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roleId: any) => {
    const roleName = roles.find(r => String(r.id) === String(roleId))?.name || 'CUSTOMER';
    const baseClasses = "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit";

    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        return <span className={`${baseClasses} bg-purple-100 text-purple-700`}><Shield size={10} /> Admin</span>;
      case 'STAFF':
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>Staff</span>;
      case 'CHEF':
        return <span className={`${baseClasses} bg-orange-100 text-orange-700`}>Chef</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>Customer</span>;
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#ac3509] to-[#ff7043] rounded-2xl shadow-lg shadow-orange-200 text-white">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#191c1d] tracking-tight">Quản lý người dùng</h1>
              <p className="text-[#59413a] font-medium opacity-80">Phân quyền và quản lý tài khoản hệ thống</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ac3509] hover:bg-[#8d2a07] text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-orange-200 active:scale-95"
          >
            <UserPlus size={20} />
            THÊM NGƯỜI DÙNG MỚI
          </button>
        </div>

        {/* Filters/Search Section */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-orange-100/50 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên, email..."
              className="w-full bg-[#f3f4f5] border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 shadow-sm"
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 shadow-sm"
            >
              Trang tiếp
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
            <Check size={20} />
            <p className="text-sm font-bold">{success}</p>
          </div>
        )}

        {/* Improved Table Table Section */}
        <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-orange-100/50">
          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-100">
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-500">Người dùng</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-500">Liên hệ</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-500">Vai trò</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-500 text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="text-[#ac3509] animate-spin" size={40} />
                        <p className="text-sm font-bold text-gray-400">Đang đồng bộ hóa dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <p className="text-lg font-bold text-gray-400 italic">Không tìm thấy người dùng nào phù hợp</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-orange-50/30 transition-colors border-b border-gray-50 last:border-b-0">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-[#ac3509] font-black shadow-sm border border-white">
                            {(user.full_name || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#191c1d] truncate">{user.full_name || 'N/A'}</p>
                            <p className="text-xs text-gray-400 font-medium">#{String(user.id).slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-[#59413a]">{user.email || '-'}</p>
                        <p className="text-xs text-gray-400">{user.phone || '-'}</p>
                      </td>
                      <td className="px-6 py-5">
                        {getRoleBadge(user.role_id)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRoleId(String(user.role_id));
                              setShowRoleModal(true);
                            }}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                            title="Đổi vai trò"
                          >
                            <Shield size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2.5 rounded-xl transition-colors ${user.deleted_at
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              }`}
                            title="Khóa/Mở tài khoản"
                          >
                            {user.deleted_at ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleRemove(user.id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title="Vô hiệu hóa vĩnh viễn"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center text-sm font-bold text-gray-400 bg-white p-6 rounded-[28px] shadow-sm border border-orange-100/50">
          <span>Tổng số: {users.length} người dùng</span>
          <div className="flex items-center gap-4">
            <span className="text-orange-600">Trang {page}</span>
          </div>
        </div>
      </div>

      {/* MODAL: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#191c1d]">Tạo người dùng mới</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-[#59413a] pl-1">Họ và tên</label>
                  <input
                    required
                    type="text"
                    value={newUser.full_name}
                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#f3f4f5] border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-[#59413a] pl-1">Email</label>
                  <input
                    required
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full bg-[#f3f4f5] border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-[#59413a] pl-1">Mật khẩu</label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#f3f4f5] border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-[#59413a] pl-1">Vai trò</label>
                  <select
                    value={newUser.role_id}
                    onChange={e => setNewUser({ ...newUser, role_id: e.target.value })}
                    className="w-full bg-[#f3f4f5] border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-[#59413a] pl-1">Số điện thoại</label>
                  <input
                    required
                    type="phone"
                    value={newUser.phone}
                    onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="0123456789"
                    className="w-full bg-[#f3f4f5] border-none rounded-2xl py-3.5 px-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-bold"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={submitting}
                    className="flex-[2] py-4 bg-[#ac3509] text-white font-black rounded-2xl shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                    XÁC NHẬN TẠO
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ROLE */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRoleModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#191c1d]">Cập nhật vai trò</h2>
                <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8 flex items-center gap-4 p-4 bg-orange-50 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-[#ac3509] text-white flex items-center justify-center font-black">
                  {(selectedUser.full_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black text-[#191c1d]">{selectedUser.full_name}</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Đang chỉnh sửa quyền hạn</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-8">
                <label className="text-xs font-black uppercase tracking-widest text-[#59413a] pl-1">Chọn vai trò mới</label>
                <select
                  value={newRoleId}
                  onChange={e => setNewRoleId(e.target.value)}
                  className="w-full bg-[#f3f4f5] border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#ac3509]/20 outline-none transition-all font-black text-lg appearance-none cursor-pointer"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={submitting}
                  className="flex-[2] py-4 bg-[#ac3509] text-white font-black rounded-2xl shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                  CẬP NHẬT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

