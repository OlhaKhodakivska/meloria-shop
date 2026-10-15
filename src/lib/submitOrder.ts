export type SubmittedOrder = {
  id: string;
  order_number?: number | string | null;
};

const unconfirmedOrderMessage =
  'Не вдалося підтвердити результат оформлення. Кошик збережено. Повторіть надсилання з тими самими даними в цій вкладці або звʼяжіться з нами.';

function readSavedOrder(value: unknown): SubmittedOrder {
  if (typeof value !== 'object' || value === null ||
      !('id' in value) || typeof value.id !== 'string' || !value.id.trim()) {
    throw new Error(unconfirmedOrderMessage);
  }

  const orderNumber = 'order_number' in value ? value.order_number : undefined;
  return {
    id: value.id,
    order_number: typeof orderNumber === 'string' || typeof orderNumber === 'number'
      ? orderNumber
      : null,
  };
}

export async function submitOrder(payload: Record<string, unknown>): Promise<SubmittedOrder> {
  // Keep an ID for each unresolved payload, including after a reload in this tab.
  // Only the hash and UUID are stored, never the customer's contact details.
  const serialized = JSON.stringify(payload);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(serialized));
  const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const storageKey = `meloria_order_request:${fingerprint}`;
  let requestId: string;
  try {
    requestId = sessionStorage.getItem(storageKey) || crypto.randomUUID();
    sessionStorage.setItem(storageKey, requestId);
  } catch {
    // Do not send a request if its ID cannot survive a reload.
    throw new Error('Для безпечного оформлення дозвольте збереження даних у браузері та спробуйте ще раз.');
  }

  let response: Response;
  try {
    response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, request_id: requestId }),
    });
  } catch {
    // A lost response does not prove that the server failed to save the order.
    throw new Error(unconfirmedOrderMessage);
  }

  if (response.status === 404) {
    throw new Error('Оформлення замовлень тимчасово недоступне. Звʼяжіться з нами.');
  }

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const message = typeof result === 'object' && result !== null &&
      'error' in result && typeof result.error === 'string'
      ? result.error
      : 'Не вдалося оформити замовлення.';
    throw new Error(message);
  }

  if (!(response.headers.get('content-type') || '').includes('application/json')) {
    throw new Error(unconfirmedOrderMessage);
  }

  const result: unknown = await response.json().catch(() => null);
  const order = readSavedOrder(
    typeof result === 'object' && result !== null && 'order' in result ? result.order : null,
  );
  // A confirmed purchase can be followed by a new, identical purchase.
  try { sessionStorage.removeItem(storageKey); } catch { /* Retaining the ID is safer than another write. */ }
  return order;
}
