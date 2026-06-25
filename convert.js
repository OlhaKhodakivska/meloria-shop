// convert.js
import fs from 'fs';
import csv from 'csvtojson';

const csvFilePath = './express.csv';
const outputFilePath = './src/data/products.ts';

console.log('Починаємо розумну конвертацію товарів Presentville за категоріями...');

const categoryRules = [
  ['Подарункові сертифікати', ['подарункова карта', 'сертифікат']],
  ['Сумки та шопери', ['сумк', 'шопер', 'бананка']],
  ['Подушки', ['подушк', 'наволочк']],
  ['Косметички', ['косметичк']],
  ['Годинники', ['годинник']],
  ['Канцелярія', ['блокнот', 'скетчбук', 'планер', 'календар', 'стікер', 'стікери', 'закладк', 'ручк', 'олів', 'щоденник']],
  ['Килимки', ['килим']],
  ['Ключниці', ['ключниц']],
  ['Листівки', ['листівк', 'конверт']],
  ['Маски для сну', ['маск']],
  ['Ігри та завдання', ['банка з завданнями', 'гра ', 'ігри', 'завдання', 'вікторин']],
  ['Купони та чекові книжки', ['купон', 'чекова книжка', 'чекові книжки']],
  ['Посуд', ['чашк', 'горнят', 'тарілк', 'пляшк', 'термокружк']],
  ['Свічки та декор', ['свічк', 'постер', 'ваза', 'кашпо', 'декор']],
  ['Брелоки та аксесуари', ['брелок', 'значок', 'пін ', 'пін-', 'дзеркальц']]
];

// Функція для автоматичного визначення категорії за назвою
function detectCategory(name) {
  const title = name.toLowerCase();
  const rule = categoryRules.find(([, keywords]) =>
    keywords.some((keyword) => title.includes(keyword))
  );

  return rule ? rule[0] : 'Інші корисні дрібниці';
}

function cleanDescription(description) {
  return description
    .replace(/<\s*br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function getProductImages(imageField) {
  return imageField
    ? imageField.split(',').map((image) => image.trim()).filter(Boolean)
    : [];
}

csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    const formattedProducts = jsonObj.map((item) => {
      const titleUk = item['name'] || item['name_ru'] || '';
      const images = getProductImages(item['image']);

      return {
        id: item['product_id'] || item['product-id'] || item['sku'],
        title: titleUk,
        price: parseFloat(item['price']) || 0,
        priceOld: parseFloat(item['price_old']) || null,
        imageUrl: images[0] || '',
        images,
        description: cleanDescription(item['description'] || ''),
        category: detectCategory(titleUk), // ТУТ викликаємо нашу функцію!
        isAvailable: true
      };
    });

    const fileContent = `import type { Product } from '../types/product';\n\nexport const MOCK_PRODUCTS: Product[] = ${JSON.stringify(formattedProducts, null, 2)};\n`;

    fs.writeFileSync(outputFilePath, fileContent, 'utf8');
    console.log(`✨ Успішно розсортовано ${formattedProducts.length} товарів по категоріях!`);
  })
  .catch((err) => {
    console.error('Помилка:', err);
  });
