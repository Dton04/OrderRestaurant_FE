import type { Order, OrderStatus } from '../types/order';

const STAFF_ORDER_STORAGE_KEY = 'staff.orderListLocal';

type LocalOrder = Pick<
  Order,
  | 'id'
  | 'staff_id'
  | 'table_id'
  | 'total_amount'
  | 'final_amount'
  | 'status'
  | 'created_at'
  | 'updated_at'
>;

const toTimestamp = (value?: string) => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (
  status?: string | OrderStatus | null,
): OrderStatus | string => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'IN_PROGRESS') {
    return 'PROCESSING';
  }

  if (normalized === 'PAID') {
    return 'COMPLETED';
  }

  return normalized || 'PENDING';
};

const isOrderObject = (value: unknown): value is LocalOrder => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return 'id' in candidate;
};

export const readLocalStaffOrders = (): LocalOrder[] => {
  const raw = localStorage.getItem(STAFF_ORDER_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isOrderObject);
  } catch {
    return [];
  }
};

const writeLocalStaffOrders = (orders: LocalOrder[]) => {
  localStorage.setItem(STAFF_ORDER_STORAGE_KEY, JSON.stringify(orders));
};

export const upsertLocalStaffOrder = (order: LocalOrder) => {
  const current = readLocalStaffOrders();
  const now = new Date().toISOString();
  const incoming: LocalOrder = {
    ...order,
    status: normalizeStatus(order.status),
    updated_at: order.updated_at || now,
    created_at: order.created_at || now,
  };

  const index = current.findIndex(
    (entry) => String(entry.id) === String(incoming.id),
  );

  if (index === -1) {
    current.push(incoming);
  } else {
    current[index] = { ...current[index], ...incoming };
  }

  current.sort(
    (left, right) => toTimestamp(right.updated_at) - toTimestamp(left.updated_at),
  );

  writeLocalStaffOrders(current.slice(0, 200));
};

export const mergeRemoteAndLocalStaffOrders = (
  remoteOrders: Order[],
  localOrders: LocalOrder[],
) => {
  const merged = new Map<string, Order>();

  remoteOrders.forEach((order) => {
    merged.set(String(order.id), order);
  });

  localOrders.forEach((localOrder) => {
    const key = String(localOrder.id);
    const remote = merged.get(key);

    if (!remote) {
      merged.set(key, localOrder as Order);
      return;
    }

    const remoteUpdated = toTimestamp(remote.updated_at || remote.created_at);
    const localUpdated = toTimestamp(localOrder.updated_at || localOrder.created_at);

    if (localUpdated >= remoteUpdated) {
      merged.set(key, { ...remote, ...localOrder, status: normalizeStatus(localOrder.status) });
    }
  });

  return Array.from(merged.values());
};
