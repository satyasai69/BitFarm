import { useState, useEffect, useCallback } from 'react';
import { ChainType, CHAINS_MAP } from '../const';

declare global {
  interface Window {
    unisat: any;
  }
}

interface Balance {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

interface UnisatWallet {
  connected: boolean;
  accounts: string[];
  publicKey: string | null;
  balance: Balance;
  network: string;
  chainType: ChainType | null;
}

export type BitcoinNetwork = 'mainnet' | 'testnet' | 'regtest' | 'fractal-mainnet' | 'fractal-testnet' | 'unknown';

const formatNetwork = (network: string, chainType: ChainType | null): string => {
  if (chainType === ChainType.FRACTAL_BITCOIN_MAINNET) {
    return 'fractal-mainnet';
  }
  if (chainType === ChainType.FRACTAL_BITCOIN_TESTNET) {
    return 'fractal-testnet';
  }
  
  switch (network.toLowerCase()) {
    case 'livenet':
    case 'mainnet':
      return 'mainnet';
    case 'testnet':
      return 'testnet';
    default:
      if (network.includes('fractal')) {
        return network.toLowerCase();
      }
      return 'unknown';
  }
};

const POLLING_INTERVAL = 5000; // 5 seconds for more responsive updates

export const useUnisat = () => {
  const [wallet, setWallet] = useState<UnisatWallet>({
    connected: false,
    accounts: [],
    publicKey: null,
    balance: {
      confirmed: 0,
      unconfirmed: 0,
      total: 0
    },
    network: 'unknown',
    chainType: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkWalletExists = useCallback((): boolean => {
    return typeof window !== 'undefined' && typeof window.unisat !== 'undefined';
  }, []);

  const updateWalletInfo = useCallback(async (forceUpdate = false) => {
    if (!window.unisat || (!wallet.connected && !forceUpdate)) return;

    try {
      const [accounts, network, chain, balance, publicKey] = await Promise.all([
        window.unisat.getAccounts(),
        window.unisat.getNetwork(),
        window.unisat.getChain(),
        window.unisat.getBalance(),
        window.unisat.getPublicKey()
      ]);

      const formattedNetwork = formatNetwork(network, chain?.enum || null);

      setWallet({
        connected: true,
        accounts,
        publicKey,
        balance: {
          confirmed: balance?.confirmed || 0,
          unconfirmed: balance?.unconfirmed || 0,
          total: balance?.total || 0
        },
        network: formattedNetwork,
        chainType: chain?.enum || null
      });
    } catch (error) {
      console.error('Error updating wallet info:', error);
      setError('Error updating wallet info. Please check your connection.');
    }
  }, [wallet.connected]);

  const connectWallet = useCallback(async () => {
    if (!checkWalletExists()) {
      setError('Unisat wallet is not installed! Please install it from unisat.io');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request accounts first
      const accounts = await window.unisat.requestAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found or user rejected');
      }

      // Get initial network and balance
      const [publicKey, balance, network, chain] = await Promise.all([
        window.unisat.getPublicKey(),
        window.unisat.getBalance(),
        window.unisat.getNetwork(),
        window.unisat.getChain()
      ]);

      const formattedNetwork = formatNetwork(network, chain?.enum || null);

      setWallet({
        connected: true,
        accounts,
        publicKey,
        balance: {
          confirmed: balance?.confirmed || 0,
          unconfirmed: balance?.unconfirmed || 0,
          total: balance?.total || 0
        },
        network: formattedNetwork,
        chainType: chain?.enum || null
      });

      // Force an immediate update after connection
      setTimeout(() => updateWalletInfo(true), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setWallet(prev => ({ ...prev, connected: false }));
    } finally {
      setIsLoading(false);
    }
  }, [checkWalletExists, updateWalletInfo]);

  const sendBitcoin = useCallback(async (address: string, amount: number) => {
    if (!checkWalletExists() || !wallet.connected) {
      setError('Wallet not connected');
      return;
    }

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > wallet.balance.total) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const txid = await window.unisat.sendBitcoin(address, amount);
      
      // Force update after transaction
      setTimeout(() => updateWalletInfo(true), 1000);
      
      return txid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [checkWalletExists, wallet.connected, wallet.balance.total, updateWalletInfo]);

  useEffect(() => {
    if (wallet.connected) {
      const interval = setInterval(() => updateWalletInfo(false), POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [wallet.connected, updateWalletInfo]);

  // Initialize wallet and set up listeners
  useEffect(() => {
    let accountsChangedHandler: ((accounts: string[]) => void) | null = null;
    let networkChangedHandler: ((network: string) => void) | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const setupEventListeners = () => {
      if (!checkWalletExists()) return;

      // Create named handlers that we can reference for cleanup
      accountsChangedHandler = async (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          setWallet(prev => ({
            ...prev,
            connected: false,
            accounts: []
          }));
        } else {
          await updateWalletInfo(true);
        }
      };

      networkChangedHandler = async () => {
        await updateWalletInfo(true);
      };

      // Add event listeners with named handlers
      window.unisat.on('accountsChanged', accountsChangedHandler);
      window.unisat.on('networkChanged', networkChangedHandler);

      // Set up polling for updates
      intervalId = setInterval(() => updateWalletInfo(false), POLLING_INTERVAL);
    };

    const initWallet = async () => {
      if (checkWalletExists()) {
        try {
          const accounts = await window.unisat.getAccounts();
          if (accounts && accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.error('Error initializing wallet:', err);
        }
      }
    };

    initWallet();
    setupEventListeners();

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      if (checkWalletExists() && window.unisat) {
        if (accountsChangedHandler) {
          window.unisat.removeListener('accountsChanged', accountsChangedHandler);
        }
        if (networkChangedHandler) {
          window.unisat.removeListener('networkChanged', networkChangedHandler);
        }
      }
    };
  }, [checkWalletExists, connectWallet, updateWalletInfo]);

  return {
    wallet,
    isLoading,
    error,
    connectWallet,
    sendBitcoin,
    updateWalletInfo: () => updateWalletInfo(true)
  };
};
