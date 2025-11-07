//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAYS USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, getAddress, Contract } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<MockFhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);
  
  console.log('[fhevmMockCreateInstance] Creating mock instance with metadata:', parameters.metadata);
  
  // Query InputVerifier contract's EIP712 domain (required for v0.9)
  const inputVerifierContract = new Contract(
    parameters.metadata.InputVerifierAddress,
    ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
    provider
  );
  
  let verifyingContractAddressInputVerification: string;
  let gatewayChainId: number;
  
  try {
    const domain = await inputVerifierContract.eip712Domain();
    verifyingContractAddressInputVerification = getAddress(domain[4]); // index 4 is verifyingContract
    gatewayChainId = Number(domain[3]); // index 3 is chainId
    console.log('[fhevmMockCreateInstance] InputVerifier EIP712 domain chainId:', gatewayChainId);
    console.log('[fhevmMockCreateInstance] InputVerifier EIP712 verifyingContract:', verifyingContractAddressInputVerification);
  } catch (error) {
    console.warn('[fhevmMockCreateInstance] Failed to query EIP712 domain, using defaults:', error);
    // Fallback to hardcoded values if query fails
    verifyingContractAddressInputVerification = getAddress("0x812b06e1CDCE800494b79fFE4f925A504a9A9810");
    gatewayChainId = 55815;
  }
  
  // Ensure all addresses are in checksum format
  const instance = await MockFhevmInstance.create(
    provider,
    provider,
    {
      aclContractAddress: getAddress(parameters.metadata.ACLAddress) as `0x${string}`,
      chainId: parameters.chainId,
      gatewayChainId: gatewayChainId,
      inputVerifierContractAddress: getAddress(parameters.metadata.InputVerifierAddress) as `0x${string}`,
      kmsContractAddress: getAddress(parameters.metadata.KMSVerifierAddress) as `0x${string}`,
      verifyingContractAddressDecryption: getAddress(
        "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64"
      ) as `0x${string}`,
      verifyingContractAddressInputVerification: verifyingContractAddressInputVerification as `0x${string}`,
    },
    {
      // Fourth parameter: properties (required for v0.9)
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  
  console.log('[fhevmMockCreateInstance] ✅ Mock FHEVM instance created successfully');
  return instance;
};

