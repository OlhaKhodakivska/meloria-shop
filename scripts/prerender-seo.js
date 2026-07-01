import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const SITE_NAME = 'MELORIA';
const SITE_URL = 'https://www.meloria.pp.ua';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png?v=2`;
const DEFAULT_LOGO = `${SITE_URL}/android-chrome-512x512.png`;
const DEFAULT_DESCRIPTION =
  'Український інтернет-магазин подарунків, аксесуарів і затишних товарів для дому. Сумки, шопери, подушки, косметички, канцелярія та доставка по Україні.';

const distDir = new URL('../dist/', import.meta.url);
const indexPath = new URL('index.html', distDir);

const pages = [
  {
    title: 'MELORIA - подарунки, аксесуари та товари для затишку',
    description: DEFAULT_DESCRIPTION,
    keywords:
      'MELORIA, Meloria shop, подарунки Україна, інтернет-магазин подарунків, аксесуари, декор для дому, сумки, шопери, подушки, косметички, канцелярія',
    path: '/',
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    title: 'Про MELORIA - український магазин подарунків і затишних деталей',
    description:
      'Дізнайтеся більше про MELORIA: красиві подарунки, аксесуари, декор для дому та добірні товари українського бренду Presentwill.',
    keywords:
      'про MELORIA, українські подарунки, Presentwill, магазин подарунків, товари українського виробництва',
    path: '/about',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    title: 'Доставка та оплата - MELORIA',
    description:
      'Умови доставки та оплати замовлень у MELORIA. Відправляємо товари Новою Поштою та Укрпоштою по всій Україні.',
    keywords: 'доставка MELORIA, оплата MELORIA, Нова Пошта, Укрпошта, доставка подарунків Україна',
    path: '/delivery',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    title: 'Безкоштовна доставка від 3000 грн - MELORIA',
    description:
      'Безкоштовна доставка замовлень MELORIA по Україні при покупці товарів на суму від 3000 грн.',
    keywords: 'безкоштовна доставка, MELORIA доставка, подарунки з доставкою, доставка від 3000 грн',
    path: '/free-delivery',
    priority: '0.7',
    changefreq: 'monthly'
  },
  {
    title: 'Повернення та обмін - MELORIA',
    description:
      'Правила повернення та обміну товарів MELORIA: терміни, умови, документи та порядок повернення коштів.',
    keywords: 'повернення товару, обмін товару, MELORIA повернення, гарантія, права покупця',
    path: '/returns-exchange',
    priority: '0.7',
    changefreq: 'monthly'
  },
  {
    title: 'Контакти MELORIA - телефон, email та Instagram',
    description:
      'Звʼяжіться з MELORIA: телефон +38 (099) 706-40-90, email info@meloria.pp.ua, Instagram @meloria.shop.',
    keywords: 'контакти MELORIA, meloria shop телефон, info@meloria.pp.ua, instagram meloria.shop',
    path: '/contacts',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    title: 'Політика конфіденційності - MELORIA',
    description:
      'Політика конфіденційності MELORIA: як ми обробляємо персональні дані клієнтів інтернет-магазину.',
    keywords: 'політика конфіденційності MELORIA, персональні дані, приватність',
    path: '/privacy-policy',
    priority: '0.4',
    changefreq: 'yearly'
  },
  {
    title: 'Умови користування - MELORIA',
    description: 'Умови користування сайтом та оформлення замовлень в інтернет-магазині MELORIA.',
    keywords: 'умови користування MELORIA, правила магазину, оформлення замовлення',
    path: '/terms-of-use',
    priority: '0.4',
    changefreq: 'yearly'
  }
];

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const buildUrl = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;

const pageJsonLd = (page) => {
  const items = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: `${SITE_URL}/`
        },
        ...(page.path === '/'
          ? []
          : [
              {
                '@type': 'ListItem',
                position: 2,
                name: page.title.replace(` - ${SITE_NAME}`, ''),
                item: buildUrl(page.path)
              }
            ])
      ]
    }
  ];

  if (page.path === '/') {
    items.unshift(
      {
        '@context': 'https://schema.org',
        '@type': 'OnlineStore',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: DEFAULT_LOGO,
        image: DEFAULT_IMAGE,
        description: DEFAULT_DESCRIPTION,
        email: 'info@meloria.pp.ua',
        telephone: '+380997064090',
        sameAs: ['https://instagram.com/meloria.shop'],
        areaServed: {
          '@type': 'Country',
          name: 'Ukraine'
        },
        currenciesAccepted: 'UAH',
        paymentAccepted: ['Card', 'IBAN'],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+380997064090',
          contactType: 'customer support',
          email: 'info@meloria.pp.ua',
          availableLanguage: ['uk', 'ru']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?search={search_term_string}#catalog`,
          'query-input': 'required name=search_term_string'
        }
      }
    );
  }

  return items;
};

const replaceMeta = (html, page) => {
  const canonicalUrl = buildUrl(page.path);
  const jsonLd = pageJsonLd(page)
    .map(
      (item, index) =>
        `<script id="seo-json-ld-${index}" data-seo-json-ld="true" type="application/ld+json">${JSON.stringify(item)}</script>`
    )
    .join('\n    ');

  return html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/s, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/>/s, `<meta name="keywords" content="${escapeHtml(page.keywords)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/s, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/s, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/s, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/s, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`)
    .replace(/<script id="static-json-ld" type="application\/ld\+json">.*?<\/script>/s, jsonLd);
};

const routeFilePath = (path) => {
  if (path === '/') {
    return new URL('index.html', distDir);
  }

  return new URL(`.${path}/index.html`, distDir);
};

const cleanUrlFilePath = (path) => new URL(`.${path}.html`, distDir);

const writeRouteHtml = async (html, page) => {
  const filePath = routeFilePath(page.path);
  const renderedHtml = replaceMeta(html, page);
  await mkdir(dirname(filePath.pathname), { recursive: true });
  await writeFile(filePath, renderedHtml);

  if (page.path !== '/') {
    await writeFile(cleanUrlFilePath(page.path), renderedHtml);
  }
};

const writeSitemap = async () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${buildUrl(page.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  await writeFile(join(distDir.pathname, 'sitemap.xml'), xml);
};

const html = await readFile(indexPath, 'utf8');

await Promise.all(pages.map((page) => writeRouteHtml(html, page)));
await writeSitemap();

console.log(`SEO prerendered ${pages.length} public routes.`);
