'use client';

import { BrowserProvider, Eip1193Provider, JsonRpcProvider } from 'ethers';
import { getNetworkConfig, isMockNetwork } from './constants';
import { loadRelayerSDK, isFhevmWindowType } from './relayerLoader';
import type { FhevmInstance } from './fhevmTypes';

// Re-export for convenience
export type { FhevmInstance } from './fhevmTypes';

/**
 * Get chain ID from EIP-1193 provider
 */
async function getChainId(provider: Eip1193Provider): Promise<number> {
  const chainId = await provider.request({ method: 'eth_chainId' });
  return Number.parseInt(chainId as string, 16);
}

/**
 * Attempt to fetch FHEVM relayer metadata from Hardhat node
 * Returns undefined if not available or invalid
 */
async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("web3_clientVersion", []);
    if (
      typeof version !== "string" ||
      !version.toLowerCase().includes("hardhat")
    ) {
      return undefined;
    }
    
    const metadata = await rpc.send("fhevm_relayer_metadata", []);
    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }
    
    if (
      !(
        "ACLAddress" in metadata &&
        typeof metadata.ACLAddress === "string" &&
        metadata.ACLAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "InputVerifierAddress" in metadata &&
        typeof metadata.InputVerifierAddress === "string" &&
        metadata.InputVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "KMSVerifierAddress" in metadata &&
        typeof metadata.KMSVerifierAddress === "string" &&
        metadata.KMSVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    return metadata as any;
  } catch {
    return undefined;
  } finally {
    rpc.destroy();
  }
}

// Factory function to create appropriate instance (following reference pattern)
export async function createFhevmInstance(
  provider: Eip1193Provider
): Promise<FhevmInstance> {
  const chainId = await getChainId(provider);
  console.log('[FHEVM Instance] Chain ID:', chainId);
  
  // Check if mock network
  if (isMockNetwork(chainId)) {
    console.log('[FHEVM Instance] Using mock network');
    const config = getNetworkConfig(chainId);
    if (!config) throw new Error(`Unknown chain ID: ${chainId}`);
    
    const fhevmRelayerMetadata = await tryFetchFHEVMHardhatNodeRelayerMetadata(config.rpcUrl);
    
    if (fhevmRelayerMetadata) {
      console.log('[FHEVM Instance] Found relayer metadata, creating mock instance');
      // Use dynamic import to avoid bundling mock-utils in production
      const fhevmMock = await import('./mock/fhevmMock');
      const mockInstance = await fhevmMock.fhevmMockCreateInstance({
        rpcUrl: config.rpcUrl,
        chainId,
        metadata: fhevmRelayerMetadata,
      });
      
      return mockInstance;
    } else {
      console.warn('[FHEVM Instance] No relayer metadata found for mock network');
    }
  }
  
  // Production Relayer SDK
  console.log('[FHEVM Instance] Using production Relayer SDK');
  if (!isFhevmWindowType(window)) {
    console.log('[FHEVM Instance] Loading Relayer SDK from CDN...');
    await loadRelayerSDK();
  }
  
  const relayerSDK = (window as any).relayerSDK;
  
  if (!relayerSDK.__initialized__) {
    console.log('[FHEVM Instance] Initializing Relayer SDK...');
    await relayerSDK.initSDK();
    relayerSDK.__initialized__ = true;
  }
  
  const config = {
    ...relayerSDK.SepoliaConfig,
    network: provider,
  };
  
  console.log('[FHEVM Instance] Creating instance with config:', config);
  const instance = await relayerSDK.createInstance(config);
  
  return instance;
}


