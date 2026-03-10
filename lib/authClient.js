'use client';

const STORAGE_KEY = 'mycricket_web_auth';
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.criclive.app').replace(/\/$/, '');

const safeJsonParse = value => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const request = async (path, {method = 'GET', token = '', body} = {}) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

export const registerWebsiteUser = async ({name, email, password}) => {
  return request('/api/auth/register', {method: 'POST', body: {name, email, password}});
};

export const loginWebsiteUser = async ({email, password}) => {
  return request('/api/auth/login', {method: 'POST', body: {email, password}});
};

export const getWebsiteMe = async token => {
  return request('/api/auth/me', {token});
};

export const getSavedWebSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = safeJsonParse(raw);
  if (!parsed?.token || !parsed?.user) {
    return null;
  }

  return parsed;
};

export const saveWebSession = session => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearWebSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
