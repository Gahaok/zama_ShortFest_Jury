'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createFhevmInstance, FhevmInstance } from './fhevmInstance';
import { Eip1193Provider } from 'ethers';

interface FhevmContextValue {
  instance: FhevmInstance | null;
  isLoading: boolean;
  error: Error | null;
  reinitialize: (provider: Eip1193Provider) => Promise<void>;
}

const FhevmContext = createContext<FhevmContextValue | null>(null);

export function FhevmProvider({ 
  children,
  provider 
}: { 
  children: ReactNode;
  provider: Eip1193Provider | null;
}) {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reinitialize = async (newProvider: Eip1193Provider) => {
    console.log('[FHEVM] Starting initialization...');
    setIsLoading(true);
    setError(null);
    try {
      const newInstance = await createFhevmInstance(newProvider);
      console.log('[FHEVM] Instance created successfully:', newInstance);
      setInstance(newInstance);
    } catch (err) {
      console.error('[FHEVM] Initialization failed:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM'));
      setInstance(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (provider) {
      reinitialize(provider);
    } else {
      setInstance(null);
    }
  }, [provider]);

  return (
    <FhevmContext.Provider value={{ instance, isLoading, error, reinitialize }}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }
  return context;
}


