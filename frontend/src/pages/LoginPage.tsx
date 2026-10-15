import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const submitUsername = (formData.get('username') as string) || username;
    const submitPassword = (formData.get('password') as string) || password;

    const nativeEvt = (e.nativeEvent || e) as unknown as { respondWith?: (promise: Promise<any>) => void };

    const validateInputs = () => {
      const newErrors: { username?: string; password?: string } = {};
      if (!submitUsername) {
        newErrors.username = 'Username is required';
      } else if (submitUsername.length < 3 || submitUsername.length > 50) {
        newErrors.username = 'Username must be 3-50 characters';
      }
      if (!submitPassword) {
        newErrors.password = 'Password is required';
      } else if (submitPassword.length < 4) {
        newErrors.password = 'Password must be at least 4 characters';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    if (!validateInputs()) {
      if (typeof nativeEvt.respondWith === 'function') {
        nativeEvt.respondWith(Promise.resolve(JSON.stringify({ error: 'Validation failed' })));
      }
      return;
    }

    setLoading(true);
    const loginPromise = (async () => {
      try {
        await login(submitUsername, submitPassword);
        setTimeout(() => navigate('/dashboard'), 50);
        return JSON.stringify({ status: 'success', username: submitUsername });
      } catch (error: any) {
        return JSON.stringify({ status: 'error', message: error?.message || 'Login failed' });
      } finally {
        setLoading(false);
      }
    })();

    if (typeof nativeEvt.respondWith === 'function') {
      nativeEvt.respondWith(loginPromise);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            POSTQODE NEXUS
          </CardTitle>
          <CardDescription className="text-base">
            From requirements to reality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
            toolname="user_login"
            tooldescription="Authenticate into PostQode Nexus with username and password"
            toolautosubmit=""
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="login-input-username">Username</Label>
              <Input
                id="login-input-username"
                name="username"
                type="text"
                placeholder="Enter your username"
                toolparamdescription="Username (e.g. admin or user)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                disabled={loading}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500" id="login-alert-error">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-input-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-input-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  toolparamdescription="Password (e.g. User@123 or Admin@123)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={loading}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              id="login-button-submit"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Demo Credentials:</p>
            <p className="mt-1">
              <strong>Admin:</strong> admin / Admin@123
            </p>
            <p>
              <strong>User:</strong> user / User@123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
