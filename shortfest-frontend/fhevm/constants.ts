// Network configurations for FHEVM
export const NETWORKS = {
  LOCALHOST: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    useMock: true,
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/',
    useMock: false,
  },
} as const;

export type NetworkConfig = typeof NETWORKS[keyof typeof NETWORKS];

export function getNetworkConfig(chainId: number): NetworkConfig | null {
  switch (chainId) {
    case 31337:
      return NETWORKS.LOCALHOST;
    case 11155111:
      return NETWORKS.SEPOLIA;
    default:
      return null;
  }
}

export function isMockNetwork(chainId: number): boolean {
  const config = getNetworkConfig(chainId);
  return config?.useMock ?? false;
}


