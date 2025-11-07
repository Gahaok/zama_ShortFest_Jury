// Auto-generated file - do not edit manually
export const ShortFestJuryAddresses = {
  localhost: '0x90570fd6f50A6274c4384A27E172BdACbdcc5744',
  sepolia: '0xB42c9fD7ddf840C3080Abf833Bbd64Fdef017802',
} as const;

export type NetworkName = keyof typeof ShortFestJuryAddresses;

export function getContractAddress(chainId: number): string | undefined {
  switch (chainId) {
    case 31337:
      return ShortFestJuryAddresses.localhost;
    case 11155111:
      return ShortFestJuryAddresses.sepolia;
    default:
      return undefined;
  }
}
