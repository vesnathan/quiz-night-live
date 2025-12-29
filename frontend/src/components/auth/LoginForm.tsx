'use client';

import { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeFilledIcon, EyeSlashFilledIcon } from './EyeIcons';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onConfirmRequired: (email: string) => void;
}

export function LoginForm({ onSuccess, onForgotPassword, onConfirmRequired }: LoginFormProps) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message === 'CONFIRM_SIGN_UP_REQUIRED') {
        onConfirmRequired(email);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  const isDisabled = !email || !password;

  return (
    <div className="space-y-4">
      <GoogleSignInButton
        isDisabled={isLoading}
        onError={setError}
      />

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        isDisabled={isLoading}
        variant="bordered"
        classNames={{
          input: 'text-white',
          label: 'text-gray-400',
        }}
      />

      <Input
        label="Password"
        type={isPasswordVisible ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        isDisabled={isLoading}
        variant="bordered"
        classNames={{
          input: 'text-white',
          label: 'text-gray-400',
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <EyeFilledIcon className="text-xl text-gray-400" />
            ) : (
              <EyeSlashFilledIcon className="text-xl text-gray-400" />
            )}
          </button>
        }
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-primary hover:text-primary-400 hover:underline"
        disabled={isLoading}
      >
        Forgot password?
      </button>

      <Button
        color="primary"
        onPress={handleLogin}
        isDisabled={isDisabled}
        isLoading={isLoading}
        className="w-full"
      >
        Log In
      </Button>
    </div>
  );
}
