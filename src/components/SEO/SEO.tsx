import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'MELORIA';
const SITE_URL = 'https://www.meloria.pp.ua';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png?v=2`;
const DEFAULT_LOGO = `${SITE_URL}/android-chrome-512x512.png`;
const DEFAULT_DESCRIPTION =
  'Український інтернет-магазин подарунків, аксесуарів і затишних товарів для дому. Сумки, шопери, подушки, косметички, канцелярія та доставка по Україні.';

type StructuredData = Record<string, unknown>;

type SeoPage = {
  title: string;
  description: string;
  keywords: string;
  path: string;
  noIndex?: boolean;
};

const pages: Record<string, SeoPage> = {
  '/': {
    title: 'MELORIA - подарунки, аксесуари та товари для затишку',
    description: DEFAULT_DESCRIPTION,
    keywords:
      'MELORIA, Meloria shop, подарунки Україна, інтернет-магазин подарунків, аксесуари, декор для дому, сумки, шопери, подушки, косметички, канцелярія',
    path: '/'
  },
  '/about': {
    title: 'Про MELORIA - український магазин подарунків і затишних деталей',
    description:
      'Дізнайтеся більше про MELORIA: красиві подарунки, аксесуари, декор для дому та добірні товари українського бренду Presentwill.',
    keywords:
      'про MELORIA, українські подарунки, Presentwill, магазин подарунків, товари українського виробництва',
    path: '/about'
  },
  '/delivery': {
    title: 'Доставка та оплата - MELORIA',
    description:
      'Умови доставки та оплати замовлень у MELORIA. Відправляємо товари Новою Поштою та Укрпоштою по всій Україні.',
    keywords: 'доставка MELORIA, оплата MELORIA, Нова Пошта, Укрпошта, доставка подарунків Україна',
    path: '/delivery'
  },
  '/free-delivery': {
    title: 'Безкоштовна доставка від 3000 грн - MELORIA',
    description:
      'Безкоштовна доставка замовлень MELORIA по Україні при покупці товарів на суму від 3000 грн.',
    keywords: 'безкоштовна доставка, MELORIA доставка, подарунки з доставкою, доставка від 3000 грн',
    path: '/free-delivery'
  },
  '/returns-exchange': {
    title: 'Повернення та обмін - MELORIA',
    description:
      'Правила повернення та обміну товарів MELORIA: терміни, умови, документи та порядок повернення коштів.',
    keywords: 'повернення товару, обмін товару, MELORIA повернення, гарантія, права покупця',
    path: '/returns-exchange'
  },
  '/contacts': {
    title: 'Контакти MELORIA - телефон, email та Instagram',
    description:
      'Звʼяжіться з MELORIA: телефон +38 (099) 706-40-90, email info@meloria.pp.ua, Instagram @meloria.shop.',
    keywords: 'контакти MELORIA, meloria shop телефон, info@meloria.pp.ua, instagram meloria.shop',
    path: '/contacts'
  },
  '/privacy-policy': {
    title: 'Політика конфіденційності - MELORIA',
    description:
      'Політика конфіденційності MELORIA: як ми обробляємо персональні дані клієнтів інтернет-магазину.',
    keywords: 'політика конфіденційності MELORIA, персональні дані, приватність',
    path: '/privacy-policy'
  },
  '/terms-of-use': {
    title: 'Умови користування - MELORIA',
    description: 'Умови користування сайтом та оформлення замовлень в інтернет-магазині MELORIA.',
    keywords: 'умови користування MELORIA, правила магазину, оформлення замовлення',
    path: '/terms-of-use'
  },
  '/checkout': {
    title: 'Оформлення замовлення - MELORIA',
    description: 'Оформлення замовлення в інтернет-магазині MELORIA.',
    keywords: 'оформлення замовлення MELORIA, кошик, купити подарунки',
    path: '/checkout',
    noIndex: true
  },
  '/auth': {
    title: 'Особистий кабінет - MELORIA',
    description: 'Вхід до особистого кабінету MELORIA.',
    keywords: 'особистий кабінет MELORIA, вхід',
    path: '/auth',
    noIndex: true
  },
  '/thank-you': {
    title: 'Дякуємо за замовлення - MELORIA',
    description: 'Дякуємо за покупку в інтернет-магазині MELORIA.',
    keywords: 'дякуємо за замовлення MELORIA',
    path: '/thank-you',
    noIndex: true
  }
};

const normalizePath = (path: string) => {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathWithoutBase = baseUrl && path.startsWith(baseUrl)
    ? path.slice(baseUrl.length) || '/'
    : path;

  return pathWithoutBase.length > 1 ? pathWithoutBase.replace(/\/$/, '') : pathWithoutBase;
};

const setMeta = (selector: string, attributeName: 'name' | 'property', attributeValue: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.content = content;
};

const setLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
};

const buildUrl = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;

const buildBreadcrumbData = (page: SeoPage): StructuredData => ({
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
});

const buildHomeStructuredData = (): StructuredData[] => [
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
    },
  ];

const updateStructuredData = (items: StructuredData[]) => {
  document.getElementById('static-json-ld')?.remove();
  document.querySelectorAll('script[data-seo-json-ld="true"]').forEach((script) => script.remove());

  items.forEach((item, index) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoJsonLd = 'true';
    script.text = JSON.stringify(item);
    script.id = `seo-json-ld-${index}`;
    document.head.appendChild(script);
  });
};

export const SEO = () => {
  const location = useLocation();

  useEffect(() => {
    const path = normalizePath(location.pathname);
    const page = pages[path] || pages['/'];
    const canonicalUrl = buildUrl(page.path);
    const isSearchPage = new URLSearchParams(location.search).has('search');
    const robots = page.noIndex || isSearchPage
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    document.documentElement.lang = 'uk';
    document.title = page.title;
    setLink('canonical', canonicalUrl);
    setMeta('meta[name="description"]', 'name', 'description', page.description);
    setMeta('meta[name="keywords"]', 'name', 'keywords', page.keywords);
    setMeta('meta[name="robots"]', 'name', 'robots', robots);
    setMeta('meta[name="author"]', 'name', 'author', SITE_NAME);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'uk_UA');
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMeta('meta[property="og:title"]', 'property', 'og:title', page.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', page.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', DEFAULT_IMAGE);
    setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', DEFAULT_IMAGE);
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', 'MELORIA - подарунки, аксесуари та товари для затишку');
    setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/png');
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', page.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_IMAGE);

    updateStructuredData([
      ...(page.path === '/' ? buildHomeStructuredData() : []),
      buildBreadcrumbData(page)
    ]);
  }, [location.pathname, location.search]);

  return null;
};
