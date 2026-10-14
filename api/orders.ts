import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import type { Product } from '../src/types/product.js';

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
  comment?: string | null;
  items: unknown[];
  total_amount: number;
  status: string;
};

type SavedOrder = Omit<OrderPayload, 'payment_details'> & {
  payment_details: string;
  id: string;
  order_number?: number | null;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateOrderPayload(payload: Partial<OrderPayload>) {
  const errors: string[] = [];
  const customerName = readText(payload.customer_name);
  const customerEmail = readText(payload.customer_email);
  const customerPhone = readText(payload.customer_phone);
  const deliveryCity = readText(payload.delivery_city);
  const deliveryBranch = readText(payload.delivery_branch);
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

  if (payload.comment !== undefined && payload.comment !== null && typeof payload.comment !== 'string') {
    errors.push('Коментар має бути текстом.');
  }

  if (!['nova_poshta', 'ukr_poshta'].includes(payload.delivery_method || '')) {
    errors.push('Оберіть доступний спосіб доставки.');
  }

  if (!['card_prepayment', 'iban_prepayment'].includes(payload.payment_method || '')) {
    errors.push('Оберіть доступний спосіб оплати.');
  }

  if (payload.payment_details !== undefined && !isRecord(payload.payment_details)) {
    errors.push('Некоректні дані способу оплати.');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('Замовлення має містити товари.');
  } else {
    const hasInvalidItem = payload.items.some((item) =>
      !isRecord(item) ||
      typeof item.product_id !== 'string' || !item.product_id.trim() ||
      typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0 ||
      typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity <= 0
    );

    if (hasInvalidItem) {
      errors.push('Перевірте товари, ціни та кількість у замовленні.');
    }
  }

  if (typeof payload.total_amount !== 'number' || !Number.isFinite(payload.total_amount) || payload.total_amount <= 0) {
    errors.push('Некоректна сума замовлення.');
  }

  return errors;
}

type RequestedItem = { product_id: string; price: number; quantity: number };

async function buildOrderFromCatalogue(requestedItems: RequestedItem[]) {
  const file = await fs.readFile(join(process.cwd(), 'public/products.json'), 'utf8');
  const catalogue: unknown = JSON.parse(file);
  if (!Array.isArray(catalogue)) throw new Error('Invalid product catalogue');

  const productsById = new Map(
    (catalogue as Product[]).map((product) => [product.id, product])
  );
  const items = [];
  const seenIds = new Set<string>();
  let totalCents = 0;

  for (const requested of requestedItems) {
    const product = productsById.get(requested.product_id);
    if (!product || !product.isAvailable) {
      return { error: 'Товар більше недоступний. Оновіть каталог і перевірте кошик.' };
    }

    if (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price <= 0) {
      throw new Error('Invalid catalogue price');
    }

    if (seenIds.has(product.id)) {
      return { error: 'Товар повторюється у замовленні. Оновіть сторінку та перевірте кошик.' };
    }
    seenIds.add(product.id);

    if (requested.price !== product.price) {
      return { error: 'Ціна товару змінилася. Оновіть сторінку, видаліть товар із кошика та додайте його знову.' };
    }

    // Calculate in kopiykas to avoid floating-point errors in currency totals.
    totalCents += Math.round(product.price * 100) * requested.quantity;
    if (!Number.isSafeInteger(totalCents) || totalCents > 999_999_999_999) {
      return { error: 'Сума замовлення перевищує допустиме значення.' };
    }

    items.push({
      product_id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      quantity: requested.quantity,
      image_url: product.imageUrl,
    });
  }

  return { items, totalAmount: totalCents / 100 };
}

async function sendTelegramOrderNotification(order: SavedOrder) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram env variables are not configured.');
    return;
  }

  const customerComment = typeof order.comment === 'string' ? order.comment.trim() : '';
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
    console.error('Telegram notification failed.');
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader('Allow', 'POST');

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return response.status(503).json({ error: 'Оформлення замовлень тимчасово недоступне. Звʼяжіться з нами.' });
  }

  try {
    if (!isRecord(request.body)) {
      return response.status(400).json({ error: 'Некоректні дані замовлення.' });
    }

    const payload = request.body as Partial<OrderPayload>;
    const validationErrors = validateOrderPayload(payload);

    if (validationErrors.length > 0) {
      return response.status(400).json({ error: validationErrors.join(' ') });
    }

    const catalogueOrder = await buildOrderFromCatalogue(payload.items as RequestedItem[]);
    if ('error' in catalogueOrder) {
      return response.status(409).json({ error: catalogueOrder.error });
    }

    if (Math.round((payload.total_amount as number) * 100) !== Math.round(catalogueOrder.totalAmount * 100)) {
      return response.status(409).json({ error: 'Сума замовлення змінилася. Оновіть каталог і перевірте кошик.' });
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
        payment_status: 'awaiting_prepayment',
        payment_details: JSON.stringify(payload.payment_details || {}),
        comment: customerComment || null,
        items: catalogueOrder.items,
        total_amount: catalogueOrder.totalAmount,
        status: 'new',
      })
      .select('*')
      .single();

    if (error) {
      return response.status(500).json({ error: 'Не вдалося зберегти замовлення. Спробуйте пізніше.' });
    }

    try {
      await sendTelegramOrderNotification(order as SavedOrder);
    } catch {
      // The order is already saved; a notification failure must not invite a retry.
      console.error('Telegram order notification could not be sent.');
    }

    return response.status(201).json({ order });
  } catch (error) {
    console.error('Order API error:', error);
    return response.status(500).json({ error: 'Failed to create order' });
  }
}
