// Dynamically load Relayer SDK from CDN (following reference pattern)
const SDK_CDN_URL = 'https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs';
const SDK_LOCAL_URL = '/relayer-sdk-js.umd.cjs';

declare global {
  interface Window {
    relayerSDK?: any;
  }
}

export function isFhevmWindowType(win: any): boolean {
  return typeof win === 'object' && win !== null && 'relayerSDK' in win;
}

export async function loadRelayerSDK(): Promise<void> {
  // Check if already loaded
  if (typeof window !== 'undefined' && isFhevmWindowType(window)) {
    return;
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('loadRelayerSDK can only be called in browser'));
      return;
    }

    // Try CDN first, fallback to local
    const tryLoadFromUrl = (url: string, isLastAttempt: boolean) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      script.onload = () => {
        if (isFhevmWindowType(window)) {
          console.log(`[RelayerSDKLoader] Successfully loaded from ${url}`);
          resolve();
        } else {
          reject(new Error('Relayer SDK loaded but not available on window'));
        }
      };

      script.onerror = () => {
        console.warn(`[RelayerSDKLoader] Failed to load from ${url}`);
        if (!isLastAttempt) {
          // Try local fallback
          tryLoadFromUrl(SDK_LOCAL_URL, true);
        } else {
          reject(new Error(`Failed to load Relayer SDK from both CDN and local`));
        }
      };

      document.head.appendChild(script);
    };

    tryLoadFromUrl(SDK_CDN_URL, false);
  });
}


