import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Tag, FileText, Check } from 'lucide-react';
import { categoryApi } from '../../api/category';
import type { Category, CreateCategoryDto } from '../../types/category';
import axios from 'axios';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSuccess, category }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image_url: '',
      });
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (category) {
        await categoryApi.update(category.id, formData);
      } else {
        await categoryApi.create(formData);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save category:', err);
      if (axios.isAxiosError(err)) {
        const data: unknown = err.response?.data;
        const message =
          data && typeof data === 'object' && 'message' in data
            ? (data as Record<string, unknown>).message
            : undefined;
        setError(
          typeof message === 'string'
            ? message
            : 'Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.',
        );
      } else {
        setError('Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-extrabold text-gray-800 tracking-tight font-heading">
              {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {category ? `ID: ${category.id}` : 'Quản lý nhóm thực đơn mới'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={12} className="text-orange-600" /> Tên danh mục
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Khai vị, Món chính..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Upload size={12} className="text-orange-600" /> Link hình ảnh đại diện
              </label>
              <input
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/category.jpg"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={12} className="text-orange-600" /> Mô tả danh mục
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả ngắn về các món ăn trong danh mục này..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-50 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-700 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-orange-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              {category ? 'Cập nhật' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
