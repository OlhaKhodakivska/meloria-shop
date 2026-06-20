import React from 'react';
import styles from './InfoPages.module.css';

export const About: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Про бренд MELORIA</h1>
    <div className={styles.content}>
      <p>Ласкаво просимо до <strong>MELORIA</strong> — простору, де естетика зустрічається з якістю. Ми пропонуємо та підбираємо унікальні подарунки, декор для дому та аксесуари, які додають затишку вашому життю.</p>
      <p>Наш бренд вірить, що краса криється в деталях. Кожен виріб у нашому каталозі — від велюрової косметички до мінімалістичного годинника — проходить ретельний відбір, щоб дарувати вам та вашим близьким виключно позитивні емоції.</p>
    </div>
  </div>
);