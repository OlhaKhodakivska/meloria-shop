// src/pages/Auth/Auth.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';

type AuthMode = 'login' | 'register';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL;

  // Спільні стани для полів
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      console.log('Вхід користувача:', { email, password });
      // Тут у майбутньому буде фетч до вашого бекенду / API авторизації
      alert('Успішний вхід у профіль MELORIA!');
    } else {
      if (password !== confirmPassword) {
        alert('Паролі не збігаються!');
        return;
      }
      console.log('Реєстрація користувача:', { name, email, password });
      alert('Обліковий запис успішно створено!');
    }

    // Після успішної дії повертаємо клієнта на головну сторінку
    navigate(baseUrl);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Заголовок бренду */}
        <div className={styles.brandHeader}>
          <h2>MELORIA<span className={styles.star}>✦</span></h2>
          <p>Ваш персональний простір естетики</p>
        </div>

        {/* Перемикач вкладок */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${mode === 'login' ? styles.activeTab : ''}`}
            onClick={() => setMode('login')}
          >
            Вхід
          </button>
          <button
            className={`${styles.tabBtn} ${mode === 'register' ? styles.activeTab : ''}`}
            onClick={() => setMode('register')}
          >
            Реєстрація
          </button>
        </div>

        {/* Форма авторизації */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label htmlFor="auth-name">Ім'я та Прізвище</label>
              <input
                type="text" id="auth-name" required
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ольга"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="auth-email">Електронна пошта</label>
            <input
              type="email" id="auth-email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="auth-password">Пароль</label>
            <input
              type="password" id="auth-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div className={styles.inputGroup}>
              <label htmlFor="auth-confirm">Підтвердження пароля</label>
              <input
                type="password" id="auth-confirm" required
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className={styles.forgotPassword}>
              <a href="#forgot" onClick={(e) => e.preventDefault()}>Забули пароль?</a>
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            {mode === 'login' ? 'Увійти' : 'Створити акаунт'}
          </button>
        </form>
      </div>
    </div>
  );
};
