export type SubmittedOrder = {
  id: string;
  order_number?: number | string | null;
};

const unconfirmedOrderMessage =
  'Не вдалося підтвердити результат оформлення. Кошик збережено. Звʼяжіться з нами перед повторним надсиланням заявки.';

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

export async function submitOrder(payload: unknown): Promise<SubmittedOrder> {
  let response: Response;
  try {
    response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
  return readSavedOrder(
    typeof result === 'object' && result !== null && 'order' in result ? result.order : null,
  );
}
