import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Settings as SettingsIcon,
  Camera,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { usersApi } from '../api/users';
import type { User as UserType } from '../types/auth';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'system'>('personal');
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    timezone: '(GMT+07:00) Bangkok, Hanoi, Jakarta',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await usersApi.getProfile();
        setUser(profile);
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          timezone: profile.timezone || '(GMT+07:00) Bangkok, Hanoi, Jakarta',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Chỉ gửi những trường mà Backend DTO hỗ trợ
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        timezone: formData.timezone
      };
      
      await usersApi.updateProfile(updateData);
      // Update local state and show success message
      setUser((prev) => (prev ? { ...prev, ...formData } : null));
      alert('Cập nhật thành công!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Hồ sơ & Cài đặt</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản cá nhân và cấu hình hệ thống vận hành</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'personal'
                ? 'bg-orange-50 text-orange-600 font-bold shadow-sm border border-orange-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserIcon size={18} />
              <span className="text-sm">Cá nhân</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'personal' ? 'opacity-100' : 'opacity-0'} />
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-orange-50 text-orange-600 font-bold shadow-sm border border-orange-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />
              <span className="text-sm">Bảo mật</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'security' ? 'opacity-100' : 'opacity-0'} />
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'system'
                ? 'bg-orange-50 text-orange-600 font-bold shadow-sm border border-orange-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon size={18} />
              <span className="text-sm">Cài đặt hệ thống</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'system' ? 'opacity-100' : 'opacity-0'} />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Personal Info Section */}
          {activeTab === 'personal' && (
            <>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden">
                      <img
                        src="https://via.placeholder.com/150"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-orange-500 text-white rounded-xl shadow-lg border-4 border-white hover:bg-orange-600 transition-all">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-gray-900">
                      {user?.role === 'CHEF' ? 'Chef' : user?.role === 'ADMIN' ? 'Admin' : 'Staff'} {user?.full_name || ''}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'CHEF' ? 'Giám đốc điều hành & Đầu bếp trưởng' : user?.role === 'ADMIN' ? 'Quản trị viên hệ thống' : 'Nhân viên vận hành'}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-all">
                        Cập nhật hồ sơ
                      </button>
                      <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all">
                        Xem công khai
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="Nhập họ tên"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="example@domain.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="+84 000 000 000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Múi giờ</label>
                    <div className="relative">
                      <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="w-full bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                        <option>(GMT+08:00) Singapore, Kuala Lumpur</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight size={14} className="rotate-90 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-[#f3f4f6] border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                      placeholder="Số 766 đường Võ Văn Kiệt, Phường Chợ Quán, Quận 5, TP. HCM"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vai trò hệ thống</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={user?.role?.toUpperCase() || 'USER'}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-orange-800 cursor-not-allowed opacity-80"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <ShieldCheck size={16} className="text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Summary in Personal Tab */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck size={18} className="text-orange-500" />
                  <h3 className="text-lg font-black text-gray-900">Bảo mật</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Lock size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Mật khẩu</p>
                        <p className="text-[11px] text-gray-500">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
                      </div>
                    </div>
                    <button className="text-xs font-black text-orange-600 hover:text-orange-700">Thay đổi</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <ShieldCheck size={18} className="text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Xác thực 2 yếu tố (2FA)</p>
                        <p className="text-[11px] text-gray-500">Tăng cường bảo mật bằng mã xác thực điện thoại</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Settings Summary in Personal Tab */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <SettingsIcon size={18} className="text-[#ac3509]" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Cài đặt hệ thống</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngôn ngữ hiển thị</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-[#f3f4f6] rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent">
                        <input type="radio" name="lang" defaultChecked className="w-4 h-4 text-[#ac3509] focus:ring-orange-500 border-gray-300" />
                        <span className="text-sm font-bold text-gray-700">Tiếng Việt</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input type="radio" name="lang" className="w-4 h-4 text-[#ac3509] focus:ring-orange-500 border-gray-300" />
                        <span className="text-sm font-bold text-gray-700">English (UK)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông báo</label>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Email đơn hàng mới</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ac3509]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Báo cáo doanh thu ngày</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ac3509]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Thông báo từ bếp</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ac3509]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button className="px-8 py-3 bg-gray-100 text-gray-700 text-sm font-black rounded-2xl hover:bg-gray-200 transition-all">
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-[#ac3509] text-white text-sm font-black rounded-2xl shadow-lg shadow-orange-900/20 hover:bg-[#8e2c07] transition-all disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[400px]">
              <h2 className="text-xl font-black text-gray-900 mb-4">Cài đặt bảo mật</h2>
              <p className="text-gray-500">Nội dung đang được cập nhật...</p>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[400px]">
              <h2 className="text-xl font-black text-gray-900 mb-4">Cài đặt hệ thống</h2>
              <p className="text-gray-500">Nội dung đang được cập nhật...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
