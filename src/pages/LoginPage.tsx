import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/axios';
import { ErrorAlert } from '../components/ui';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getRememberedEmail, getRememberMePreference, saveAuthSession } from '../utils/authSession';

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: getRememberedEmail(), password: '' });
  const [rememberMe, setRememberMe] = useState(getRememberMePreference);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await login(form);
      const authData = res.data.data;

      if (!authData) {
        throw new Error('Login failed');
      }

      saveAuthSession({
        token: authData.token,
        user: authData.user,
        remember: rememberMe,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white font-display font-bold text-2xl shadow-app">
            S
          </div>
          <span className="font-display text-3xl font-bold text-white">Spendly</span>
        </div>

        <div className="card p-8 border-surface-600/50">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:text-white focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M3 3l18 18M9.88 9.88A3 3 0 0 0 14.12 14.12M10.73 5.08A10.94 10.94 0 0 1 12 5c5.25 0 8.75 4.5 10 7-0.48 0.96-1.42 2.32-2.77 3.56M6.62 6.62C4.43 7.86 2.94 10.04 2 12c1.25 2.5 4.75 7 10 7 1.9 0 3.57-0.59 4.97-1.47"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2 12s3.75-7 10-7 10 7 10 7-3.75 7-10 7S2 12 2 12Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      />
                    </svg>
                  )}
                </button>
              }
              required
            />

            <label
              htmlFor="remember-me"
              className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition-all duration-200"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-surface-600 text-transparent transition-all duration-200 peer-checked:scale-105 peer-checked:border-brand-400 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-400">
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 10.5 8.2 14 15 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="select-none">
                Remember Me
              </span>
            </label>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
