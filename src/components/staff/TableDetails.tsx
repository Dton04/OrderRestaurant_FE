import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TableDetails: React.FC<{ table: any }> = ({ table }) => {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (table?.id) {
      axios.get(`/orders?table_id=${table.id}`).then(res => {
        setOrder(res.data?.[0] || null);
      });
    }
  }, [table]);

  if (!table) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md min-h-[180px] flex flex-col items-center justify-center">
        <div className="text-gray-400 font-bold text-lg">No Table Selected</div>
        <div className="text-xs text-gray-400">Select a table to manage status or create a new order.</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md min-h-[180px]">
      <div className="font-bold text-lg mb-2">Table {table.table_number || table.id}</div>
      <div className="text-xs mb-2">Status: <span className="font-bold">{table.status}</span></div>
      {order ? (
        <div>
          <div className="font-bold text-orange-600 mb-1">Current Order</div>
          <div className="text-xs mb-2">Order ID: {order.id}</div>
          <div className="text-xs mb-2">Guests: {order.guests}</div>
          {/* ...thêm chi tiết order nếu muốn... */}
        </div>
      ) : (
        <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded font-bold text-xs">New Order</button>
      )}
    </div>
  );
};

export default TableDetails;
