import React, { useState, useEffect } from 'react';
import { useUnisat } from '../hooks/useUnisat';

const SendTransaction: React.FC = () => {
  const { wallet, isLoading, error: walletError, sendBitcoin } = useUnisat();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when wallet connection changes
    if (!wallet.connected) {
      setAddress('');
      setAmount('');
      setError(null);
      setSuccess(null);
    }
  }, [wallet.connected]);

  const getExplorerUrl = (txid: string): string => {
    const network = wallet.network.toLowerCase();
    if (network.includes('test')) {
      return `https://mempool.space/testnet/tx/${txid}`;
    }
    return `https://mempool.space/tx/${txid}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!address) {
      setError('Please enter a recipient address');
      return;
    }

    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    const amountInSats = parseInt(amount);
    if (isNaN(amountInSats) || amountInSats <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const txid = await sendBitcoin(address, amountInSats);
      if (txid) {
        const explorerUrl = getExplorerUrl(txid);
        setSuccess(`Transaction sent! View on explorer: ${explorerUrl}`);
        setAddress('');
        setAmount('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    }
  };

  const handleMaxClick = () => {
    setAmount(wallet.balance.total.toString());
  };

  if (!wallet.connected) {
    return (
      <div className="send-transaction">
        <h3>Send Bitcoin</h3>
        <p className="warning">Please connect your wallet first</p>
      </div>
    );
  }

  return (
    <div className="send-transaction">
      <h3>Send Bitcoin</h3>
      <div className="balance-info">
        <p>Available Balance: {wallet.balance.total.toLocaleString()} sats</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address">Recipient Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={error && !address ? 'invalid' : ''}
            placeholder="Enter Bitcoin address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (sats):</label>
          <div className="amount-input-wrapper">
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={error && !amount ? 'invalid' : ''}
              placeholder="Enter amount in sats"
            />
            <button
              type="button"
              className="max-button"
              onClick={handleMaxClick}
              disabled={wallet.balance.total <= 0}
            >
              MAX
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading || wallet.balance.total <= 0}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {walletError && <p className="error">{walletError}</p>}
      {success && (
        <div className="success">
          {success.includes('http') ? (
            <>
              Transaction sent! View on explorer:{' '}
              <a href={success.split(': ')[1]} target="_blank" rel="noopener noreferrer">
                {success.split(': ')[1]}
              </a>
            </>
          ) : (
            success
          )}
        </div>
      )}
      {wallet.balance.total <= 0 && (
        <p className="warning">Insufficient balance</p>
      )}
    </div>
  );
};

export default SendTransaction;
