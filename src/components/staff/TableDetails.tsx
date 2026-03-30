import React, { useEffect, useState } from 'react';

const TableDetails: React.FC<{ table: any }> = ({ table }) => {
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    if (table) {
      setGuestCount(typeof table.guests === 'number' ? table.guests : 0);
    }
  }, [table]);

  const incrementGuest = () => {
    if (!table) return;
    const cap = typeof table.capacity === 'number' ? table.capacity : Infinity;
    setGuestCount((prev) => Math.min(prev + 1, cap));
  };

  const decrementGuest = () => {
    setGuestCount((prev) => Math.max(prev - 1, 0));
  };

  if (!table) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md min-h-[350px] flex flex-col items-center justify-center">
        <div className="text-gray-400 font-bold text-lg">Chưa chọn bàn</div>
        <div className="text-xs text-gray-400">Vui lòng chọn một bàn để quản lý số người.</div>
      </div>
    );
  }

  const capacity = typeof table.capacity === 'number' ? table.capacity : 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow-md min-h-[350px]">
      <div className="mb-4">
        <div className="font-extrabold text-xl">Bàn {table.table_number || table.id}</div>
        <div className="text-xs mt-1">Trạng thái: <span className="font-bold">{table.status || 'N/A'}</span></div>
      </div>

      <div className="mb-5">
        <div className="font-bold text-sm mb-2">Số người hiện tại</div>
        <div className="flex items-center gap-4">
          <button onClick={decrementGuest} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xl font-bold">−</button>
          <div className="text-4xl font-bold">{guestCount}</div>
          <button onClick={incrementGuest} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xl font-bold">+</button>
        </div>
        <div className="mt-2 text-xs text-zinc-500">Sức chứa: {capacity} người</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => alert(`Cập nhật số người: ${guestCount}`)}
          className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
        >
          Lưu số người
        </button>
        <button
          onClick={() => setGuestCount(0)}
          className="flex-1 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          Xóa số người
        </button>
      </div>
    </div>
  );
};

export default TableDetails;

