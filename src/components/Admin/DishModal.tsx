import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, DollarSign, Tag, FileText, Check } from 'lucide-react';
import { dishApi } from '../../api/dish';
import type { Dish, CreateDishDto } from '../../types/dish';
import type { Category } from '../../types/category';
import axios from 'axios';

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dish?: Dish | null;
  categories: Category[];
}

const DishModal: React.FC<DishModalProps> = ({ isOpen, onClose, onSuccess, dish, categories }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDishDto>({
    name: '',
    description: '',
    price: 0,
    category_id: categories[0]?.id || 0,
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        category_id: dish.category_id,
        image_url: dish.image_url || '',
        is_available: dish.is_available ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: categories[0]?.id || 0,
        image_url: '',
        is_available: true,
      });
    }
    setError(null);
  }, [dish, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (dish) {
        await dishApi.update(dish.id, formData);
      } else {
        await dishApi.create(formData);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save dish:', err);
      if (axios.isAxiosError(err)) {
        const data: unknown = err.response?.data;
        const message =
          data && typeof data === 'object' && 'message' in data
            ? (data as Record<string, unknown>).message
            : undefined;
        setError(
          typeof message === 'string'
            ? message
            : 'Có lỗi xảy ra khi lưu món ăn. Vui lòng thử lại.',
        );
      } else {
        setError('Có lỗi xảy ra khi lưu món ăn. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'price' || name === 'category_id' ? Number(value) : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-extrabold text-gray-800 tracking-tight font-heading">
              {dish ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {dish ? `ID: ${dish.id}` : 'Điền thông tin món ăn mới'}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={12} className="text-orange-600" /> Tên món ăn
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Phở Bò Tái Lăn"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign size={12} className="text-orange-600" /> Giá bán (VND)
              </label>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={12} className="text-orange-600" /> Danh mục
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Upload size={12} className="text-orange-600" /> Link hình ảnh
              </label>
              <input
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={12} className="text-orange-600" /> Mô tả món ăn
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả ngắn về nguyên liệu và cách chế biến..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
            </div>
            
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="is_available" className="text-[11px] font-bold text-gray-600 uppercase tracking-tight cursor-pointer">
                Đang phục vụ (Còn hàng)
              </label>
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
              {dish ? 'Cập nhật' : 'Thêm món'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishModal;
