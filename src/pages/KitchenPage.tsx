
import KitchenOrderCard from "../components/KitchenOrderCard";

type OrderStatus = "COOKING" | "DONE" | "PENDING";

interface Order {
  tableNumber: number;
  ticketId: string;
  status: OrderStatus;
  duration: string;
  items: { name: string; quantity: number; note?: string }[];
}

export default function KitchenPage() {
  const orders: Order[] = [
    {
      tableNumber: 12,
      ticketId: "1001",
      status: "COOKING",
      duration: "12:48",
      items: [
        { name: "Classic Wagyu Burger", quantity: 2 },
        { name: "Truffle Fries", quantity: 1 },
        { name: "Caesar Salad", quantity: 1 },
      ],
    },
    {
      tableNumber: 6,
      ticketId: "1002",
      status: "PENDING",
      duration: "15:42",
      items: [
        { name: "Ribeye Steak", quantity: 3 },
        { name: "Mashed Potatoes", quantity: 2 },
      ],
    },
  ];

  return (
    <div className="w-screen min-h-screen bg-white text-black flex flex-col">
      {/* TOP BAR */}
      <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-300">
        <h1 className="text-xl font-bold text-green-600">KDS KITCHEN</h1>
        <div className="flex gap-8 text-sm font-bold">
          <span className="text-red-600">12 Pending</span>
          <span className="text-yellow-600">5 Cooking</span>
          <span className="text-gray-700">CURRENT TIME: 19:59:10</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 gap-6">
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.ticketId}
              {...order}
              onAction={(action) =>
                console.log("Action:", action, order.ticketId)
              }
            />
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
          <span>STATION: HOT LINE | PRINTER: ONLINE</span>
          <span>SYSTEM ACTIVE V2.4.0</span>
        </div>
      </div>
    </div>
  );
}
