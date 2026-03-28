import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { authApi } from '../api/auth';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.login({ email, password });
      console.log('Login success:', response);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/admin/users');
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err)) {
        const data: unknown = err.response?.data;
        const message =
          data && typeof data === 'object' && 'message' in data
            ? (data as Record<string, unknown>).message
            : undefined;
        setError(
          typeof message === 'string'
            ? message
            : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
        );
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Chào mừng trở lại" 
      subtitle="Đăng nhập để quản lý nhà hàng của bạn ngay hôm nay"
    >
      <div className="w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 italic">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email hoặc Số điện thoại
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ef5b1b] transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.com"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5b1b]/20 focus:border-[#ef5b1b] outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <Link to="#" className="text-xs font-semibold text-[#ef5b1b] hover:text-[#d44d15] transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ef5b1b] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ef5b1b]/20 focus:border-[#ef5b1b] outline-none transition-all placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${rememberMe ? 'bg-[#ef5b1b] border-[#ef5b1b]' : 'bg-transparent border-gray-300 group-hover:border-gray-400'}`}>
                  {rememberMe && <ShieldCheck size={14} className="text-white" />}
                </div>
              </div>
              <span className="ml-2.5 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ef5b1b] hover:bg-[#d44d15] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            Đăng nhập
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-[#ef5b1b] hover:text-[#d44d15] underline-offset-4 hover:underline transition-all">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
