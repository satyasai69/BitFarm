import React from 'react';
import { useUnisat, BitcoinNetwork, getNetworkType } from '../hooks/useUnisat';
import { ChainType } from '../const';

const WalletConnect: React.FC = () => {
  const { wallet, isLoading, error, connectWallet, disconnectWallet } = useUnisat();

  const formatBalance = (sats: number): string => {
    return sats.toLocaleString();
  };

  const getNetworkDisplay = (network: string, chainType: ChainType | null): string => {
    if (chainType === ChainType.FRACTAL_BITCOIN_MAINNET) {
      return 'Fractal Mainnet';
    }
    if (chainType === ChainType.FRACTAL_BITCOIN_TESTNET) {
      return 'Fractal Testnet';
    }
    
    switch (network) {
      case 'mainnet':
        return 'Bitcoin Mainnet';
      case 'testnet':
        return 'Bitcoin Testnet';
      default:
        return 'Unknown Network';
    }
  };

  const getNetworkBadgeColor = (network: string, chainType: ChainType | null): string => {
    if (chainType === ChainType.FRACTAL_BITCOIN_MAINNET) {
      return '#4CAF50';
    }
    if (chainType === ChainType.FRACTAL_BITCOIN_TESTNET) {
      return '#FF9800';
    }
    
    switch (network) {
      case 'mainnet':
        return '#2196F3';
      case 'testnet':
        return '#FF5722';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="wallet-connect">
      {!wallet.connected ? (
        <button 
          onClick={connectWallet}
          disabled={isLoading}
          className="connect-button"
        >
          {isLoading ? 'Connecting...' : 'Connect Unisat Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <div 
            className="network-badge"
            style={{ backgroundColor: getNetworkBadgeColor(wallet.network, wallet.chainType) }}
          >
            {getNetworkDisplay(wallet.network, wallet.chainType)}
          </div>
          <h3>Wallet Connected</h3>
          <div className="address-container">
            <p className="label">Address:</p>
            <p className="value">{wallet.accounts[0]}</p>
          </div>
          <div className="balance-container">
            <div className="balance-item">
              <p className="label">Total Balance:</p>
              <p className="value highlight">{formatBalance(wallet.balance.total)} sats</p>
            </div>
            <div className="balance-item">
              <p className="label">Confirmed:</p>
              <p className="value">{formatBalance(wallet.balance.confirmed)} sats</p>
            </div>
            <div className="balance-item">
              <p className="label">Unconfirmed:</p>
              <p className="value">{formatBalance(wallet.balance.unconfirmed)} sats</p>
            </div>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default WalletConnect;
