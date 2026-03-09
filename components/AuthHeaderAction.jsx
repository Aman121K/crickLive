'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {clearWebSession, getSavedWebSession, getWebsiteMe, saveWebSession} from '@/lib/authClient';

const AuthHeaderAction = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const saved = getSavedWebSession();
    setSession(saved);

    if (!saved?.token) {
      return;
    }

    getWebsiteMe(saved.token)
      .then(payload => {
        const nextSession = {token: saved.token, user: payload.user};
        saveWebSession(nextSession);
        setSession(nextSession);
      })
      .catch(() => {
        clearWebSession();
        setSession(null);
      });
  }, []);

  if (!session?.user) {
    return (
      <Link href="/login" className="loginLink">
        Log In
      </Link>
    );
  }

  const name = String(session.user.name || 'User').trim() || 'User';
  const firstName = name.split(/\s+/)[0];

  return (
    <button
      type="button"
      className="loginLink"
      onClick={() => {
        clearWebSession();
        setSession(null);
      }}>
      {firstName} (Logout)
    </button>
  );
};

export default AuthHeaderAction;
