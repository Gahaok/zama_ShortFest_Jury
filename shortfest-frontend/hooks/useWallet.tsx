'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Eip1193Provider } from 'ethers';

interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: Eip1193Provider;
}

interface WalletContextValue {
  account: string | null;
  chainId: number | null;
  provider: Eip1193Provider | null;
  isConnected: boolean;
  isConnecting: boolean;
  availableWallets: EIP6963ProviderDetail[];
  connect: (rdns?: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Persistence keys
const STORAGE_KEYS = {
  CONNECTED: 'wallet.connected',
  CONNECTOR_ID: 'wallet.lastConnectorId',
  ACCOUNTS: 'wallet.lastAccounts',
  CHAIN_ID: 'wallet.lastChainId',
} as const;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<Eip1193Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<EIP6963ProviderDetail[]>([]);

  // EIP-6963: Discover wallets
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAnnouncement = (event: CustomEvent<EIP6963ProviderDetail>) => {
      setAvailableWallets((prev) => {
        // Avoid duplicates
        if (prev.some((w) => w.info.uuid === event.detail.info.uuid)) {
          return prev;
        }
        return [...prev, event.detail];
      });
    };

    window.addEventListener('eip6963:announceProvider', handleAnnouncement as EventListener);

    // Request providers to announce themselves
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnouncement as EventListener);
    };
  }, []);

  // Setup provider event listeners
  const setupListeners = useCallback((prov: any) => {
    if (!prov.on) return; // Not all providers support events
    
    prov.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        disconnect();
      } else {
        setAccount(accounts[0]);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
        }
      }
    });

    prov.on('chainChanged', (newChainId: string) => {
      const parsedChainId = parseInt(newChainId, 16);
      setChainId(parsedChainId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CHAIN_ID, parsedChainId.toString());
      }
      // Optionally reload or reinitialize
      window.location.reload();
    });

    prov.on('disconnect', () => {
      disconnect();
    });
  }, []);

  // Connect wallet
  const connect = async (rdns?: string) => {
    setIsConnecting(true);
    try {
      let selectedProvider: Eip1193Provider | undefined;

      if (rdns) {
        // Connect to specific wallet by RDNS
        const wallet = availableWallets.find((w) => w.info.rdns === rdns);
        if (!wallet) {
          throw new Error(`Wallet with RDNS ${rdns} not found`);
        }
        selectedProvider = wallet.provider;
      } else if (availableWallets.length > 0) {
        // Use first available wallet
        selectedProvider = availableWallets[0].provider;
      } else if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Fallback to window.ethereum
        selectedProvider = (window as any).ethereum;
      } else {
        throw new Error('No wallet provider found');
      }

      if (!selectedProvider) {
        throw new Error('No wallet provider selected');
      }

      // Request accounts (shows wallet popup)
      const accounts = await selectedProvider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // Get chain ID
      const currentChainId = await selectedProvider.request({
        method: 'eth_chainId',
      }) as string;

      const parsedChainId = parseInt(currentChainId, 16);

      setAccount(accounts[0]);
      setChainId(parsedChainId);
      setProvider(selectedProvider);
      setIsConnected(true);

      // Persist
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true');
        localStorage.setItem(STORAGE_KEYS.CONNECTOR_ID, rdns || 'default');
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
        localStorage.setItem(STORAGE_KEYS.CHAIN_ID, parsedChainId.toString());
      }

      // Setup listeners
      setupListeners(selectedProvider);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setIsConnected(false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CONNECTED);
      localStorage.removeItem(STORAGE_KEYS.CONNECTOR_ID);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.CHAIN_ID);
    }
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!provider) {
      throw new Error('No provider connected');
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added to wallet
      if (error.code === 4902) {
        throw new Error('Network not added to wallet. Please add it manually.');
      }
      throw error;
    }
  };

  // Silent reconnect on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const wasConnected = localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true';
    const lastConnectorId = localStorage.getItem(STORAGE_KEYS.CONNECTOR_ID);

    if (!wasConnected) return;

    const silentReconnect = async () => {
      try {
        let reconnectProvider: Eip1193Provider | undefined;

        if (lastConnectorId && lastConnectorId !== 'default') {
          const wallet = availableWallets.find((w) => w.info.rdns === lastConnectorId);
          if (wallet) {
            reconnectProvider = wallet.provider;
          }
        }

        if (!reconnectProvider && (window as any).ethereum) {
          reconnectProvider = (window as any).ethereum;
        }

        if (!reconnectProvider) {
          // Clear stale state
          disconnect();
          return;
        }

        // Use eth_accounts (no popup)
        const accounts = await reconnectProvider.request({
          method: 'eth_accounts',
        }) as string[];

        if (accounts.length === 0) {
          // User disconnected from wallet
          disconnect();
          return;
        }

        // Get chain ID
        const currentChainId = await reconnectProvider.request({
          method: 'eth_chainId',
        }) as string;

        const parsedChainId = parseInt(currentChainId, 16);

        setAccount(accounts[0]);
        setChainId(parsedChainId);
        setProvider(reconnectProvider);
        setIsConnected(true);

        // Setup listeners
        setupListeners(reconnectProvider);
      } catch (error) {
        console.error('Silent reconnect failed:', error);
        disconnect();
      }
    };

    // Wait for wallets to be discovered
    setTimeout(silentReconnect, 100);
  }, [availableWallets, setupListeners]);

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        provider,
        isConnected,
        isConnecting,
        availableWallets,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}


