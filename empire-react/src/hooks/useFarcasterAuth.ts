import { useState } from 'react';
import { useSignIn } from '@farcaster/auth-kit';

export function useFarcasterAuth() {
  const [error, setError] = useState<Error | null>(null);
  const { signIn, data, isError, isSuccess } = useSignIn({
    onSuccess: () => {
      setError(null);
    },
    onError: () => {
      setError(new Error('Failed to connect to Farcaster'));
    }
  });

  const connect = async () => {
    try {
      await signIn();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      console.error('Error connecting to Farcaster:', error);
      throw error;
    }
  };

  return {
    isError,
    isSuccess,
    error,
    data,
    connect,
  } as const;
}

export default useFarcasterAuth;
