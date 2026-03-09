'use client';

import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {loginWebsiteUser, registerWebsiteUser, saveWebSession} from '@/lib/authClient';

const LoginPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  const isDisabled = useMemo(() => {
    if (!email.trim() || !password.trim()) {
      return true;
    }

    if (isRegister && !name.trim()) {
      return true;
    }

    return false;
  }, [email, isRegister, name, password]);

  const handleSubmit = async event => {
    event.preventDefault();

    if (isDisabled || submitting) {
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const payload = isRegister
        ? await registerWebsiteUser({
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
          })
        : await loginWebsiteUser({
            email: email.trim(),
            password: password.trim(),
          });

      saveWebSession({
        token: payload.token,
        user: payload.user,
      });

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Unable to authenticate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pageShell authShell">
      <section className="authCard">
        <p className="heroTag">{isRegister ? 'Create Account' : 'Sign In'}</p>
        <h1>{isRegister ? 'Start your MyCricket account' : 'Welcome back'}</h1>
        <p className="authSubtext">
          Use the same backend auth flow for website, mobile app, and browser sessions.
        </p>

        <div className="authModeSwitch" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
            aria-selected={mode === 'login'}>
            Log In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
            aria-selected={mode === 'register'}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          {isRegister ? (
            <label>
              <span>Full Name</span>
              <input value={name} onChange={event => setName(event.target.value)} placeholder="Your name" />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {error ? <p className="authError">{error}</p> : null}

          <button type="submit" className="authSubmit" disabled={isDisabled || submitting}>
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
