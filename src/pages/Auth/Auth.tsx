// src/pages/Auth/Auth.tsx
import React, { useState } from 'react';
import { SignIn, SignUp, SignedIn, SignedOut, UserProfile } from '@clerk/clerk-react';
import styles from './Auth.module.css';

type AuthMode = 'login' | 'register';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const clerkAppearance = {
  elements: {
    rootBox: styles.clerkRoot,
    cardBox: styles.clerkRoot,
  },
};

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  if (!clerkPublishableKey) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.brandHeader}>
            <h2>MELORIA<span className={styles.star}>✦</span></h2>
            <p>Авторизація Clerk ще не налаштована</p>
          </div>
          <p className={styles.errorMessage}>
            Додайте `VITE_CLERK_PUBLISHABLE_KEY` у `.env`, щоб увімкнути реальну
            реєстрацію та вхід.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.clerkCard}>
        <SignedIn>
          <UserProfile routing="hash" />
        </SignedIn>

        <SignedOut>
          <div className={styles.brandHeader}>
            <h2>MELORIA<span className={styles.star}>✦</span></h2>
            <p>Ваш персональний простір естетики</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${mode === 'login' ? styles.activeTab : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Вхід
            </button>
            <button
              className={`${styles.tabBtn} ${mode === 'register' ? styles.activeTab : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Реєстрація
            </button>
          </div>

          {mode === 'login' ? (
            <SignIn
              routing="hash"
              signUpUrl="#/sign-up"
              appearance={clerkAppearance}
            />
          ) : (
            <SignUp
              routing="hash"
              signInUrl="#/sign-in"
              appearance={clerkAppearance}
            />
          )}
        </SignedOut>
      </div>
    </div>
  );
};
