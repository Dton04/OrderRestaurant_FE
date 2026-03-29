import React, { useState, useEffect } from 'react';
import { X, Loader2, Monitor, Users, Check, MapPin } from 'lucide-react';
import { tableApi } from '../../api/table';
import type { Table, CreateTableDto } from '../../types/table';
import axios from 'axios';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  table?: Table | null;
}

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onSuccess, table }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTableDto>({
    table_number: '',
    capacity: 4,
    area_id: 1, // Default area
    status: 'FREE',
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        area_id: table.area_id || 1,
        status: table.status || 'FREE',
      });
    } else {
      setFormData({
        table_number: '',
        capacity: 4,
        area_id: 1,
        status: 'FREE',
      });
    }
    setError(null);
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (table) {
        await tableApi.update(table.id, formData);
      } else {
        await tableApi.create(formData);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save table:', err);
      if (axios.isAxiosError(err)) {
        const data: unknown = err.response?.data;
        const message =
          data && typeof data === 'object' && 'message' in data
            ? (data as Record<string, unknown>).message
            : undefined;
        setError(
          typeof message === 'string'
            ? message
            : 'Có lỗi xảy ra khi lưu thông tin bàn. Vui lòng thử lại.',
        );
      } else {
        setError('Có lỗi xảy ra khi lưu thông tin bàn. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' || name === 'area_id' ? Number(value) : value 
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-extrabold text-gray-800 tracking-tight font-heading">
              {table ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {table ? `ID: ${table.id}` : 'Thiết lập bàn ăn mới'}
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
                <Monitor size={12} className="text-orange-600" /> Số hiệu bàn
              </label>
              <input
                required
                name="table_number"
                value={formData.table_number}
                onChange={handleChange}
                placeholder="Ví dụ: T1.01, V.02..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={12} className="text-orange-600" /> Sức chứa
                </label>
                <input
                  required
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-orange-600" /> Khu vực
                </label>
                <select
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                >
                  <option value={1}>Tầng 1</option>
                  <option value={2}>Tầng 2</option>
                  <option value={3}>Sân vườn</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                Trạng thái ban đầu
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none"
              >
                <option value="FREE">Sẵn sàng (FREE)</option>
                <option value="OCCUPIED">Đang có khách (OCCUPIED)</option>
                <option value="RESERVED">Đã đặt trước (RESERVED)</option>
                <option value="CLEANING">Đang dọn dẹp (CLEANING)</option>
              </select>
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
              {table ? 'Cập nhật' : 'Thêm bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;
