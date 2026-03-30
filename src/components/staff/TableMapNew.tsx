import React, { useEffect, useState } from 'react';
import { tableApi } from '../../api/table';

const statusColor = {
  FREE: 'bg-green-500 text-white',
  OCCUPIED: 'bg-orange-500 text-white',
  RESERVED: 'bg-indigo-500 text-white',
  CLEANING: 'bg-cyan-500 text-white',
};

const statusLabel = {
  FREE: 'Free',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  CLEANING: 'Cleaning',
};

const TableMapNew: React.FC<{ onSelectTable: (table: any) => void }> = ({ onSelectTable }) => {
  const [tables, setTables] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const payload = await tableApi.findAll();

        if (Array.isArray(payload)) {
          setTables(payload);
        } else {
          setTables([]);
          console.warn('TableMapNew: unexpected response payload from tableApi.findAll()', payload);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch tables in TableMapNew:', err);
        setError('Không tải được danh sách bàn. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Đang tải sơ đồ bàn...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-6 pt-5">
      {tables.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl p-4 shadow-md cursor-pointer flex flex-col justify-between min-h-[110px] ${statusColor[t.status as keyof typeof statusColor]}`}
          onClick={() => onSelectTable(t)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold opacity-80">{t.table_number || t.id}</span>
            <span className="text-lg">{t.guests || ''}</span>
          </div>
          <div className="text-xs font-bold uppercase opacity-80">{statusLabel[t.status as keyof typeof statusLabel] || 'Unknown'}</div>
        </div>
      ))}
    </div>
  );
};

export default TableMapNew;
