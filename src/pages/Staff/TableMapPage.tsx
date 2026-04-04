import React, { useEffect, useState } from 'react';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import StaffTopBar from '../../components/staff/StaffTopBar';
import TableMapNew from '../../components/staff/TableMapNew';
import TableDetails from '../../components/staff/TableDetails';
import { tableApi } from '../../api/table';

type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

type StaffTable = {
  id: string | number;
  table_number?: string;
  capacity?: number;
  status?: TableStatus | string;
  area_id?: number;
  guests?: number;
  guestsField?: 'guests' | 'guest_count' | 'current_guest' | 'current_guests' | 'number_of_guests';
};

const TABLE_GUESTS_STORAGE_KEY = 'staff.tableGuests';

const readGuestOverrides = (): Record<string, number> => {
  const raw = localStorage.getItem(TABLE_GUESTS_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const toNumberOrUndefined = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeTable = (raw: unknown): StaffTable => {
  const data = (raw as Record<string, unknown>) || {};
  const overrides = readGuestOverrides();
  const id = (data.id as string | number) ?? '';
  const idKey = String(id);
  const detectedGuestsField =
    'guests' in data
      ? 'guests'
      : 'guest_count' in data
        ? 'guest_count'
        : 'current_guest' in data
          ? 'current_guest'
          : 'current_guests' in data
            ? 'current_guests'
            : 'number_of_guests' in data
              ? 'number_of_guests'
              : undefined;

  const guestsFromApi =
    toNumberOrUndefined(data.guests) ??
    toNumberOrUndefined(data.guest_count) ??
    toNumberOrUndefined(data.current_guest) ??
    toNumberOrUndefined(data.current_guests) ??
    toNumberOrUndefined(data.number_of_guests);

  return {
    id,
    table_number:
      (typeof data.table_number === 'string' ? data.table_number : undefined) ||
      (typeof data.tableNo === 'string' ? data.tableNo : undefined),
    capacity: toNumberOrUndefined(data.capacity),
    status: typeof data.status === 'string' ? data.status : undefined,
    area_id: toNumberOrUndefined(data.area_id),
    guests: overrides[idKey] ?? guestsFromApi ?? 0,
    guestsField: detectedGuestsField,
  };
};

const TableMapPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<StaffTable | null>(null);
  const [tables, setTables] = useState<StaffTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const payload = await tableApi.findAll();
        setTables(Array.isArray(payload) ? payload.map(normalizeTable) : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tables in TableMapPage:', err);
        setError('Không tải được danh sách bàn. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleGuestSaved = (tableId: string | number, guests: number) => {
    setTables((current) =>
      current.map((table) =>
        String(table.id) === String(tableId)
          ? {
              ...table,
              guests,
              status:
                guests > 0 && table.status === 'FREE'
                  ? 'OCCUPIED'
                  : guests === 0 && table.status === 'OCCUPIED'
                    ? 'FREE'
                    : table.status,
            }
          : table,
      ),
    );

    setSelectedTable((current) => {
      if (!current || String(current.id) !== String(tableId)) {
        return current;
      }

      return {
        ...current,
        guests,
        status:
          guests > 0 && current.status === 'FREE'
            ? 'OCCUPIED'
            : guests === 0 && current.status === 'OCCUPIED'
              ? 'FREE'
              : current.status,
      };
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-hidden">
      <StaffTopBar />
      <StaffSidebarNew />
      <main className="ml-64 relative pt-[88px]">
        <section className="pt-28 pb-10 px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="rounded-2xl min-h-[760px] p-4 bg-white border border-zinc-100 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary-container" /> Available</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Occupied</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> Reserved</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Cleaning</span>
                </div>
              </div>
              {loading ? (
                <div className="text-center p-8 text-gray-500">Đang tải sơ đồ bàn...</div>
              ) : error ? (
                <div className="text-center p-8 text-red-500">{error}</div>
              ) : (
                <TableMapNew tables={tables} onSelectTable={setSelectedTable} />
              )}
            </div>

            <div className="rounded-2xl p-5 bg-white border border-zinc-100 shadow-sm">
              <TableDetails
                key={selectedTable ? String(selectedTable.id) : 'none'}
                table={selectedTable}
                onGuestSaved={handleGuestSaved}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TableMapPage;
