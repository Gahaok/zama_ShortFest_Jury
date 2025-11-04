// Re-export FhevmInstance type from Relayer SDK
// This ensures compatibility with both Mock and Production instances
export type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";

// v0.3.0 renamed DecryptedResults to UserDecryptResults
import * as RelayerSDKBundle from "@zama-fhe/relayer-sdk/bundle";
export type UserDecryptResults = RelayerSDKBundle.UserDecryptResults;

// Backwards compatibility alias
export type DecryptedResults = UserDecryptResults;
