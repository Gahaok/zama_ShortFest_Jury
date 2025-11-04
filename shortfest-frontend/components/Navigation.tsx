'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '../hooks/useWallet';
import { useState, useEffect } from 'react';
import { useShortFestJury } from '../hooks/useShortFestJury';

export function Navigation() {
  const pathname = usePathname();
  const { account, chainId, isConnected, disconnect, connect, availableWallets } = useWallet();
  const { isJuror, owner } = useShortFestJury();
  const [isOwner, setIsOwner] = useState(false);
  const [isJurorRole, setIsJurorRole] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!account) return;

    // Check roles
    owner().then((ownerAddr) => {
      setIsOwner(ownerAddr.toLowerCase() === account.toLowerCase());
    }).catch(() => setIsOwner(false));

    isJuror(account).then(setIsJurorRole).catch(() => setIsJurorRole(false));
  }, [account, owner, isJuror]);

  const handleConnect = async (rdns?: string) => {
    try {
      await connect(rdns);
      setShowWalletModal(false);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const navLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-3 py-2 rounded-lg font-medium transition-all ${
      isActive 
        ? 'bg-primary text-white shadow-lg' 
        : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
    }`;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 glass-effect border-b border-text-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold film-gradient bg-clip-text text-transparent">
                🎬 ShortFest Jury
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link href="/results" className={navLinkClass('/results')}>
                Results
              </Link>
              {isJurorRole && (
                <Link href="/review" className={navLinkClass('/review')}>
                  My Reviews
                </Link>
              )}
              {isOwner && (
                <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
              )}
            </div>

            {/* Wallet & Network */}
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-background-elevated"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Network Badge */}
              {chainId && (
                <div className="hidden sm:flex items-center px-3 py-1 bg-background-elevated rounded-lg text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  {chainId === 31337 ? 'Localhost' : chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}`}
                </div>
              )}
              
              {/* Wallet */}
              {isConnected && account ? (
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-2 bg-background-elevated rounded-lg">
                    {/* Role Badge */}
                    {(isOwner || isJurorRole) && (
                      <div className="text-xs text-primary font-semibold mb-1">
                        {isOwner ? '👑 Organizer' : '🎭 Juror'}
                      </div>
                    )}
                    <span className="text-sm font-mono">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="hidden sm:block px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="btn-primary text-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-text-muted/20">
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/" 
                  className={navLinkClass('/')}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/results" 
                  className={navLinkClass('/results')}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Results
                </Link>
                {isJurorRole && (
                  <Link 
                    href="/review" 
                    className={navLinkClass('/review')}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Reviews
                  </Link>
                )}
                {isOwner && (
                  <Link 
                    href="/dashboard" 
                    className={navLinkClass('/dashboard')}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {isConnected && account && (
                  <button
                    onClick={() => {
                      disconnect();
                      setShowMobileMenu(false);
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm text-left"
                  >
                    Disconnect Wallet
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Connect Wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-text-secondary hover:text-text-primary text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {availableWallets.length > 0 ? (
                availableWallets.map((wallet) => (
                  <button
                    key={wallet.info.uuid}
                    onClick={() => handleConnect(wallet.info.rdns)}
                    className="w-full flex items-center space-x-4 p-4 bg-background-elevated hover:bg-accent rounded-lg transition-colors"
                  >
                    {wallet.info.icon && (
                      <img src={wallet.info.icon} alt={wallet.info.name} className="w-8 h-8" />
                    )}
                    <span className="font-semibold">{wallet.info.name}</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">No wallets detected</p>
                  <p className="text-sm text-text-muted">Please install MetaMask or another EIP-6963 compatible wallet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


