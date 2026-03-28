import React from "react";

type OrderItem = {
  name: string;
  quantity: number;
  note?: string;
};

type OrderStatus = "COOKING" | "DONE" | "PENDING";

interface Props {
  tableNumber: number;
  ticketId: string;
  status: OrderStatus;
  duration: string;
  items: OrderItem[];
  onAction: (action: string) => void;
}

const KitchenOrderCard: React.FC<Props> = ({
  tableNumber,
  ticketId,
  status,
  duration,
  items,
  onAction,
}) => {
  const timeAgo = `${duration} min ago`;

  // màu border theo trạng thái
  const statusBorder =
    status === "PENDING"
      ? "border-red-500"
      : status === "COOKING"
      ? "border-yellow-500"
      : "border-green-500";

  return (
    <div
      className={`bg-white ${statusBorder} border-2 rounded-2xl shadow-xl p-5 flex flex-col justify-between`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900">
            Table {tableNumber}
          </h2>
          <p className="text-sm text-gray-500">Order #{ticketId}</p>
        </div>
        <div className="text-right">
          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            {timeAgo}
          </span>
        </div>
      </div>

      {/* ITEMS */}
      <div className="flex-1">
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-2xl font-bold text-green-600">
                x{item.quantity}
              </span>
              <div>
                <p className="font-bold text-lg text-gray-900">{item.name}</p>
                {item.note && (
                  <p className="text-sm text-gray-500 italic">{item.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <button
          onClick={() => onAction("IN_PROGRESS")}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl"
        >
          In Progress
        </button>
        <button
          onClick={() => onAction("READY")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
        >
          Ready
        </button>
        <button
          onClick={() => onAction("CANCEL")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default KitchenOrderCard;
