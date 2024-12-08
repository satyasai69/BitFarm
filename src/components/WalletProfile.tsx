import React, { useState, useEffect } from 'react';
import '../styles/WalletProfile.css';

interface WalletProfileProps {
    address: string;
    onClose: () => void;
    onLogout: () => void;
    isOpen: boolean;
}

const WalletProfile: React.FC<WalletProfileProps> = ({ address, onClose, onLogout, isOpen }) => {
    const [balance, setBalance] = useState<{ confirmed: number; unconfirmed: number; total: number } | null>(null);
    const [sendAmount, setSendAmount] = useState('');
    const [amountType, setAmountType] = useState<'btc' | 'sats'>('sats');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    // Generate avatar from address
    const avatarUrl = `https://avatars.dicebear.com/api/identicon/${address}.svg`;

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const balance = await window.unisat.getBalance();
                setBalance(balance);
            } catch (err) {
                console.error('Error fetching balance:', err);
            }
        };

        if (isOpen) {
            fetchBalance();
        }
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            // Clear all local storage
            localStorage.clear();
            
            // Disconnect from Unisat
            if (window.unisat) {
                await window.unisat.disconnect();
            }
            
            // Call parent logout handler
            onLogout();
            
            // Close profile dialog
            onClose();
        } catch (err) {
            console.error('Logout error:', err);
            // Still proceed with logout even if disconnect fails
            localStorage.clear();
            onLogout();
            onClose();
        }
    };

    const convertToSats = (amount: string): number => {
        if (amountType === 'btc') {
            return Math.floor(parseFloat(amount) * 100000000);
        }
        return Math.floor(parseFloat(amount));
    };

    const handleSendBTC = async () => {
        setError('');
        setIsSending(true);
        try {
            if (!sendAmount || !recipientAddress) {
                throw new Error('Please fill in all fields');
            }

            const amountInSats = convertToSats(sendAmount);
            if (isNaN(amountInSats) || amountInSats <= 0) {
                throw new Error('Invalid amount');
            }

            // Request signature for the transaction
            const message = `Send ${amountInSats} sats to ${recipientAddress}`;
            const signature = await window.unisat.signMessage(message);

            if (!signature) {
                throw new Error('Transaction not authorized');
            }
            
            // Send transaction through Unisat
            const txid = await window.unisat.sendBitcoin(recipientAddress, amountInSats);
            
            // Clear form and show success
            setSendAmount('');
            setRecipientAddress('');
            alert(`Transaction sent! TXID: ${txid}`);
            
            // Refresh balance
            const newBalance = await window.unisat.getBalance();
            setBalance(newBalance);
        } catch (err) {
            console.error('Transaction error:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="wallet-profile-overlay">
            <div className="wallet-profile-modal">
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <div className="profile-header">
                    <img src={avatarUrl} alt="Wallet Avatar" className="wallet-avatar" />
                    <div className="address-display">
                        <span className="label">Address:</span>
                        <span className="address">{address}</span>
                    </div>
                </div>

                <div className="balance-section">
                    <h3>Balance</h3>
                    {balance ? (
                        <div className="balance-details">
                            <div className="balance-item">
                                <span className="label">Total:</span>
                                <span className="value">
                                    {balance.total.toLocaleString()} sats
                                    <span className="btc-value">
                                        ({(balance.total / 100000000).toFixed(8)} BTC)
                                    </span>
                                </span>
                            </div>
                            <div className="balance-item">
                                <span className="label">Confirmed:</span>
                                <span className="value">{balance.confirmed.toLocaleString()} sats</span>
                            </div>
                            <div className="balance-item">
                                <span className="label">Unconfirmed:</span>
                                <span className="value">{balance.unconfirmed.toLocaleString()} sats</span>
                            </div>
                        </div>
                    ) : (
                        <p>Loading balance...</p>
                    )}
                </div>

                <div className="send-section">
                    <h3>Send Bitcoin</h3>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                        />
                        <div className="amount-input-group">
                            <input
                                type="number"
                                placeholder={`Amount (${amountType.toUpperCase()})`}
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                                step={amountType === 'btc' ? '0.00000001' : '1'}
                                min="0"
                            />
                            <select 
                                value={amountType}
                                onChange={(e) => setAmountType(e.target.value as 'btc' | 'sats')}
                                className="amount-type-select"
                            >
                                <option value="sats">SATS</option>
                                <option value="btc">BTC</option>
                            </select>
                        </div>
                        <button 
                            className="send-button"
                            onClick={handleSendBTC}
                            disabled={isSending}
                        >
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="actions-section">
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletProfile;
