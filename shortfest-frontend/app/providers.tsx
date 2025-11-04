'use client';

import { ReactNode } from 'react';
import { WalletProvider, useWallet } from '../hooks/useWallet';
import { FhevmProvider } from '../fhevm/useFhevm';

function FhevmWrapper({ children }: { children: ReactNode }) {
  const { provider } = useWallet();
  
  return (
    <FhevmProvider provider={provider}>
      {children}
    </FhevmProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <FhevmWrapper>
        {children}
      </FhevmWrapper>
    </WalletProvider>
  );
}


