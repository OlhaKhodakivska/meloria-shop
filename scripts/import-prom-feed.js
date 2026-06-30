import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const feedUrl = process.argv[2] || 'https://ecwid.presentville.com.ua/feed/prom_ua.xml';
const outputFilePath = './public/products.json';
const localFeedPath = '/tmp/prom_ua.xml';

const expressDescription = 'Відправка відбувається наступного робочого дня після оплати.';
const madeToOrderDescription =
  'Виробник виготовляє на замовлення. Зазвичай потрібно від 2 до 5 робочих днів після оплати.';

const categoryRules = [
  ['Подарункові сертифікати', ['подарункова карта', 'сертифікат']],
  ['Сумки та шопери', ['сумк', 'шопер', 'рюкзак', 'клатч']],
  ['Подушки', ['подушк', 'наволочк']],
  ['Косметички', ['косметичк']],
  ['Годинники', ['годинник']],
  ['Канцелярія', ['блокнот', 'скетчбук', 'планер', 'календар', 'стікер', 'закладк', 'ручк', 'олів', 'щоденник']],
  ['Килимки', ['килим']],
  ['Ключниці', ['ключниц']],
  ['Листівки', ['листівк', 'конверт']],
  ['Маски для сну', ['маск']],
  ['Ігри та завдання', ['банка з завданнями', 'гра ', 'ігри', 'завдання', 'вікторин']],
  ['Купони та чекові книжки', ['купон', 'чекова книжка', 'чекові книжки']],
  ['Посуд', ['чашк', 'горнят', 'тарілк', 'пляшк', 'термокружк', 'підставк']],
  ['Свічки та декор', ['свічк', 'постер', 'картина', 'ваза', 'кашпо', 'декор']],
  ['Брелоки та аксесуари', ['брелок', 'значок', 'пін ', 'пін-', 'дзеркальц', 'обкладинк', 'кредитниц']]
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '#text',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true
});

function valueFromXml(value) {
  if (Array.isArray(value)) {
    return value.map(valueFromXml).filter(Boolean).join(' ');
  }

  if (value && typeof value === 'object') {
    if ('#text' in value) {
      return valueFromXml(value['#text']);
    }

    return Object.values(value).map(valueFromXml).filter(Boolean).join(' ');
  }

  return String(value ?? '').trim();
}

function cleanDescription(description) {
  return valueFromXml(description)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function detectCategory(title, xmlCategory) {
  const searchableText = `${title} ${xmlCategory}`.toLocaleLowerCase('uk');
  const rule = categoryRules.find(([, keywords]) =>
    keywords.some((keyword) => searchableText.includes(keyword))
  );

  return rule ? rule[0] : 'Інші корисні дрібниці';
}

function normalizeImageList(picture) {
  const pictures = Array.isArray(picture) ? picture : [picture];

  return pictures.map(valueFromXml).filter(Boolean);
}

async function readFeed() {
  if (feedUrl.startsWith('file://')) {
    return fs.readFileSync(new URL(feedUrl), 'utf8');
  }

  if (fs.existsSync(feedUrl)) {
    return fs.readFileSync(feedUrl, 'utf8');
  }

  if (feedUrl === 'local' && fs.existsSync(localFeedPath)) {
    return fs.readFileSync(localFeedPath, 'utf8');
  }

  const response = await fetch(feedUrl);

  if (!response.ok) {
    throw new Error(`Не вдалося завантажити XML: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function buildCategoryMap(categories) {
  return new Map(
    categories.map((category) => [
      String(category['@_id']),
      valueFromXml(category)
    ])
  );
}

function normalizeExistingProduct(product) {
  return {
    ...product,
    deliveryGroup: product.deliveryGroup || 'express',
    deliveryLabel: product.deliveryLabel || 'Експрес',
    deliveryDescription: product.deliveryDescription || expressDescription
  };
}

function offerToProduct(offer, categoryMap) {
  const id = String(offer['@_id'] || '').trim();
  const title = valueFromXml(offer.name_ua || offer.name);
  const images = normalizeImageList(offer.picture);
  const categoryName = categoryMap.get(String(offer.categoryId)) || '';
  const isAvailable = valueFromXml(offer.available || offer['@_available']) !== 'false';

  return {
    id,
    title,
    price: Number.parseFloat(valueFromXml(offer.price)) || 0,
    priceOld: null,
    imageUrl: images[0] || '',
    images,
    description: cleanDescription(offer.description_ua || offer.description),
    category: detectCategory(title, categoryName),
    isAvailable,
    deliveryGroup: 'made_to_order',
    deliveryLabel: 'Під замовлення',
    deliveryDescription: madeToOrderDescription
  };
}

async function main() {
  const existingProducts = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
  const existingIds = new Set(existingProducts.map((product) => String(product.id)));
  const xml = await readFeed();
  const feed = parser.parse(xml);
  const categories = feed.shop?.categories?.category || [];
  const offers = feed.shop?.offers?.offer || [];
  const categoryMap = buildCategoryMap(Array.isArray(categories) ? categories : [categories]);
  const offerList = Array.isArray(offers) ? offers : [offers];
  const importedProducts = offerList
    .map((offer) => offerToProduct(offer, categoryMap))
    .filter((product) => product.id && product.title && !existingIds.has(product.id));
  const products = [
    ...existingProducts.map(normalizeExistingProduct),
    ...importedProducts
  ];

  fs.writeFileSync(outputFilePath, `${JSON.stringify(products, null, 2)}\n`, 'utf8');

  console.log(`Експрес: ${existingProducts.length}`);
  console.log(`Під замовлення додано: ${importedProducts.length}`);
  console.log(`Усього в каталозі: ${products.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
