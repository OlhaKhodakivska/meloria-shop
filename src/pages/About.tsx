import React from 'react';
import styles from './InfoPages.module.css';

export const About: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Про MELORIA</h1>
    <div className={styles.content}>
      <p>
  <strong>Meloria</strong> — магазин подарунків, декору та речей
  для дому. Ми обираємо товари, що додають
  затишку щодня й допомагають висловити турботу про близьких.
</p>

<p>
  Ми почали з продукції українського бренду <strong>Presentwill</strong>.
  У його асортименті знайшли те, що близьке ідеї
  <strong> Meloria</strong>: поєднання практичності, красивого
  дизайну та уваги до деталей.
</p>

<p>
  Тут ви можете обрати подарунок до свята, невеликий знак уваги
  або щось для себе. Адже улюблена чашка, нова деталь інтер’єру
  чи вдало підібраний аксесуар можуть зробити звичайний
  день приємнішим.
</p>

<p>
  За <strong>Meloria</strong> стоїть бажання розвивати власну справу
  та підтримувати українських виробників.
</p>
    </div>
  </div>
);
