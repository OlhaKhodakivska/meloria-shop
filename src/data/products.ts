import type { Product } from '../types/product';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Стильна еко-сумка "Veloria Touch"',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop', // Тимчасові красиві фото, потім замінимо на реальні
    description: 'Зручна та міцна сумка для щоденного використання з унікальним авторським принтом.',
    category: 'Сумки',
    isAvailable: true
  },
  {
    id: '2',
    title: 'Декоративна подушка "Silver Star"',
    price: 380,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600&auto=format&fit=crop',
    description: 'М’яка подушка, яка додасть затишку вашій кімнаті. Ідеально пасує до сучасного інтер’єру.',
    category: 'Декор',
    isAvailable: true
  },
  {
    id: '3',
    title: 'Косметичка велюрова "Midnight Blue"',
    price: 290,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
    description: 'Елегантна косметичка для зберігання ваших улюблених дрібниць у дорозі та вдома.',
    category: 'Аксесуари',
    isAvailable: true
  },
  {
    id: '4',
    title: 'Настінний годинник "Minimalist"',
    price: 620,
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop',
    description: 'Безшумний кварцовий годинник у стилі мінімалізму, який підкреслить ваш смак.',
    category: 'Декор',
    isAvailable: true
  }
];