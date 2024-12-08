import React, { useState, useEffect } from 'react';
import '../styles/WalletProfile.css';
import { COLORS, AVATAR_CONFIG, NETWORK } from '../const';

const generatePixelAvatar = (address: string) => {
    const canvas = document.createElement('canvas');
    const size = AVATAR_CONFIG.SIZE;
    const scale = AVATAR_CONFIG.SCALE;
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Use address as seed for randomization
    let seedValue = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (max: number) => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return Math.floor((seedValue / 233280) * max);
    };

    // Generate pixel pattern
    const pattern = Array(size).fill(0).map(() => Array(size).fill(false));
    
    // Generate random pixels for left half
    for (let x = 0; x < size / 2; x++) {
        for (let y = 0; y < size; y++) {
            if (random(100) > 50) {
                const colorIndex = random(AVATAR_CONFIG.COLORS.length);
                pattern[x][y] = colorIndex;
                // Mirror to right side
                pattern[size - 1 - x][y] = colorIndex;
            }
        }
    }

    // Draw the pattern
    pattern.forEach((row, x) => {
        row.forEach((colorIndex, y) => {
            if (colorIndex !== false) {
                ctx.fillStyle = AVATAR_CONFIG.COLORS[colorIndex as number];
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        });
    });

    return canvas.toDataURL();
};

interface WalletProfileProps {
    address: string;
    network: string;
    onClose: () => void;
    onLogout: () => void;
    isOpen: boolean;
}

const WalletProfile: React.FC<WalletProfileProps> = ({ address, network, onClose, onLogout, isOpen }) => {
    const [balance, setBalance] = useState<{ confirmed: number; unconfirmed: number; total: number } | null>(null);
    const [sendAmount, setSendAmount] = useState('');
    const [amountType, setAmountType] = useState<'btc' | 'sats'>('sats');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        // Generate avatar when address changes
        setAvatarUrl(generatePixelAvatar(address));
    }, [address]);

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
            localStorage.clear();
            if (window.unisat) {
                await window.unisat.disconnect();
            }
            onLogout();
            onClose();
        } catch (err) {
            console.error('Logout error:', err);
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
                    <div className="avatar-container">
                        <img src={avatarUrl} alt="Wallet Avatar" className="wallet-avatar" />
                        <div className="network-badge-large">
                            {network === NETWORK.MAINNET ? 'MAINNET' : 'TESTNET'}
                        </div>
                    </div>
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
