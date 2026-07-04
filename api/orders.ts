import { createClient } from '@supabase/supabase-js';

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type OrderPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  delivery_city: string;
  delivery_branch: string;
  payment_method: string;
  payment_status: string;
  payment_details: Record<string, unknown>;
  comment?: string;
  items: unknown[];
  total_amount: number;
  status: string;
};

type SavedOrder = OrderPayload & {
  id: string;
  order_number?: number | null;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatPaymentMethod(paymentMethod: string) {
  return paymentMethod === 'iban_prepayment'
    ? '100% передплата на IBAN'
    : '100% передплата на картку';
}

const ukrainianNameRegex = /^[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ]+(?:[ '\u2019-][А-ЩЬЮЯЄІЇҐа-щьюяєіїґ]+)+$/;
const ukrainianTextRegex = /^[0-9А-ЩЬЮЯЄІЇҐа-щьюяєіїґ№.,!?():;"'`\u2019\-\s/]+$/;
const ukrainianPhoneRegex = /^\+380\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const branchRegex = /^(відділення|поштомат|пункт|№|[0-9])/i;

function validateOrderPayload(payload: Partial<OrderPayload>) {
  const errors: string[] = [];
  const customerName = String(payload.customer_name || '').trim();
  const customerEmail = String(payload.customer_email || '').trim();
  const customerPhone = String(payload.customer_phone || '').trim();
  const deliveryCity = String(payload.delivery_city || '').trim();
  const deliveryBranch = String(payload.delivery_branch || '').trim();
  const customerComment =
    typeof payload.comment === 'string'
      ? payload.comment.trim()
      : typeof payload.payment_details?.customer_comment === 'string'
        ? payload.payment_details.customer_comment.trim()
        : '';

  if (!ukrainianNameRegex.test(customerName)) {
    errors.push('Вкажіть прізвище та імʼя кирилицею.');
  }

  if (!emailRegex.test(customerEmail)) {
    errors.push('Вкажіть коректну електронну пошту.');
  }

  if (!ukrainianPhoneRegex.test(customerPhone)) {
    errors.push('Телефон має бути у форматі +380XXXXXXXXX.');
  }

  if (!ukrainianTextRegex.test(deliveryCity) || deliveryCity.length < 2) {
    errors.push('Вкажіть український населений пункт кирилицею.');
  }

  if (!ukrainianTextRegex.test(deliveryBranch) || !branchRegex.test(deliveryBranch)) {
    errors.push('Вкажіть відділення або поштомат, наприклад "Відділення №4".');
  }

  if (customerComment && !ukrainianTextRegex.test(customerComment)) {
    errors.push('Коментар до замовлення має бути українською кирилицею.');
  }

  return errors;
}

async function sendTelegramOrderNotification(order: SavedOrder) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram env variables are not configured.');
    return;
  }

  const customerComment =
    typeof order.comment === 'string' && order.comment.trim()
      ? order.comment
      : typeof order.payment_details?.customer_comment === 'string'
      ? order.payment_details.customer_comment
      : '';
  const orderNumber = order.order_number ? `№${order.order_number}` : order.id;

  const text = `
<b>📦 НОВЕ ЗАМОВЛЕННЯ НА САЙТІ!</b>

<b>🆔 Номер заявки:</b> ${escapeHtml(orderNumber)}
<b>👤 Клієнт:</b> ${escapeHtml(order.customer_name)}
<b>📞 Телефон:</b> ${escapeHtml(order.customer_phone)}
<b>📧 Email:</b> ${escapeHtml(order.customer_email)}
<b>🚚 Доставка:</b> ${escapeHtml(order.delivery_city)}, ${escapeHtml(order.delivery_branch)}
<b>💳 Оплата:</b> ${escapeHtml(formatPaymentMethod(order.payment_method))}
<b>💰 Сума замовлення:</b> ${escapeHtml(order.total_amount)} грн
<b>💬 Коментар до замовлення:</b> ${escapeHtml(customerComment || '-')}
`.trim();

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Telegram notification failed:', errorText);
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader('Allow', 'POST');

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return response.status(500).json({ error: 'Supabase is not configured.' });
  }

  try {
    const payload = request.body as Partial<OrderPayload>;
    const validationErrors = validateOrderPayload(payload);

    if (validationErrors.length > 0) {
      return response.status(400).json({ error: validationErrors.join(' ') });
    }

    const customerComment =
      typeof payload.comment === 'string'
        ? payload.comment.trim()
        : typeof payload.payment_details?.customer_comment === 'string'
          ? payload.payment_details.customer_comment.trim()
          : '';

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name: payload.customer_name?.trim(),
        customer_email: payload.customer_email?.trim().toLowerCase(),
        customer_phone: payload.customer_phone?.trim(),
        delivery_method: payload.delivery_method,
        delivery_city: payload.delivery_city?.trim(),
        delivery_branch: payload.delivery_branch?.trim(),
        payment_method: payload.payment_method,
        payment_status: payload.payment_status || 'awaiting_prepayment',
        payment_details: payload.payment_details || {},
        comment: customerComment || null,
        items: payload.items || [],
        total_amount: payload.total_amount,
        status: payload.status || 'new',
      })
      .select('*')
      .single();

    if (error) {
      return response.status(400).json({ error: error.message });
    }

    await sendTelegramOrderNotification(order as SavedOrder);

    return response.status(201).json({ order });
  } catch (error) {
    console.error('Order API error:', error);
    return response.status(500).json({ error: 'Failed to create order' });
  }
}
