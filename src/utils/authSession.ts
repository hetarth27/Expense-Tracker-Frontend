import { User } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';
const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

let sessionToken: string | null = null;
let sessionUser: User | null = null;

export const getStoredUser = (): User | null => {
  const user = sessionUser ?? localStorage.getItem(USER_KEY);

  if (!user) return null;
  if (typeof user !== 'string') return user;

  try {
    return JSON.parse(user) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const getAuthToken = (): string | null => sessionToken ?? localStorage.getItem(TOKEN_KEY);

export const isAuthenticated = (): boolean => Boolean(getAuthToken());

export const saveAuthSession = ({
  token,
  user,
  remember,
}: {
  token: string;
  user: User;
  remember: boolean;
}) => {
  sessionToken = token;
  sessionUser = user;

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
    localStorage.setItem(REMEMBERED_EMAIL_KEY, user.email);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
};

export const getRememberMePreference = (): boolean =>
  localStorage.getItem(REMEMBER_ME_KEY) === 'true';

export const getRememberedEmail = (): string =>
  localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';

export const clearAuthSession = () => {
  sessionToken = null;
  sessionUser = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
