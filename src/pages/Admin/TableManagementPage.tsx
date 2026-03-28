import React, { useEffect, useState } from 'react';
import { Plus, Users, Monitor, Map, Info, Loader2 } from 'lucide-react';
import { tableApi } from '../../api/table';
import type { Table } from '../../types/table';

const TableManagementPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const areas = [
    { id: 1, name: 'Tầng 1', count: 12 },
    { id: 2, name: 'Tầng 2', count: 8 },
    { id: 3, name: 'VIP Garden', count: 4 },
  ];

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await tableApi.findAll();
      setTables(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Không thể tải danh sách bàn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'FREE':
        return { label: 'Trống', color: 'bg-green-50 text-green-600 border-green-100' };
      case 'OCCUPIED':
        return { label: 'Đang dùng', color: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'CLEANING':
        return { label: 'Chờ dọn', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' };
      case 'RESERVED':
        return { label: 'Đã đặt', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      default:
        return { label: 'N/A', color: 'bg-gray-50 text-gray-500 border-gray-100' };
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-500 text-sm">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-1.5 text-[10px] font-black text-gray-400 mb-1 uppercase tracking-tighter">
            <span>Quản trị</span>
            <span>›</span>
            <span className="text-orange-600">Sơ đồ bàn</span>
          </nav>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Bàn</h2>
          <p className="text-gray-400 text-xs mt-0.5 opacity-80">Sơ đồ nhà hàng thời gian thực.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 bg-white border border-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all text-[11px] tracking-tight uppercase">
            <Map size={16} />
            Quản lý Khu vực
          </button>
          <button className="flex items-center gap-1.5 bg-orange-700 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-800 transition-all shadow shadow-orange-100 text-[11px] tracking-tight uppercase">
            <Plus size={16} />
            Thêm bàn mới
          </button>
        </div>
      </div>

      <div className="flex gap-3 p-1 bg-gray-50 w-fit rounded-xl border border-gray-100">
        {areas.map((area, i) => (
          <button key={i} className={`px-4 py-2 rounded-lg text-[11px] font-black tracking-tight uppercase transition-all ${
            i === 0 ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}>
            {area.name} ({tables.filter(t => t.area_id === area.id).length || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="animate-spin text-orange-600" size={32} />
          <p className="text-xs font-black uppercase tracking-widest">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center space-y-3">
          <p className="text-red-600 font-bold">{error}</p>
          <button 
            onClick={fetchTables}
            className="px-6 py-2 bg-white border border-red-100 rounded-xl text-[10px] font-black uppercase text-red-600 hover:bg-red-100 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => {
            const statusInfo = getStatusInfo(table.status);
            return (
              <div key={table.id} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:scale-[1.03] cursor-pointer shadow-sm ${statusInfo.color}`}>
                <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center border border-white/60">
                  <Monitor size={24} />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg tracking-tight leading-none">{table.table_number}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 opacity-70">
                    <Users size={10} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">C: {table.capacity}</span>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.1em]">{statusInfo.label}</span>
              </div>
            );
          })}
          <button className="p-4 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-orange-100 hover:text-orange-400 transition-all group">
            <div className="w-10 h-10 rounded-full border border-dashed border-gray-100 flex items-center justify-center group-hover:border-orange-100 transition-all">
              <Plus size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Thêm bàn</span>
          </button>
        </div>
      )}

      <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100/50 flex gap-3 items-start">
        <div className="p-2 bg-white rounded-lg text-orange-600 shadow-sm border border-orange-50">
          <Info size={18} />
        </div>
        <div>
          <h4 className="font-black text-orange-800 text-xs mb-0.5 tracking-tight">Hướng dẫn</h4>
          <p className="text-[11px] text-orange-700/70 leading-relaxed font-medium">
            Dữ liệu được cập nhật từ hệ thống quản lý bàn thời gian thực. Bấm vào bàn để xem chi tiết hoặc thay đổi trạng thái.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableManagementPage;
