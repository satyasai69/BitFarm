import React, { useState, useEffect } from 'react';
import '../styles/WalletConnect.css';

interface WalletConnectProps {
    onWalletConnected: (address: string, network: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnected }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);

    const checkWalletInstalled = () => {
        return typeof window.unisat !== 'undefined';
    };

    const clearWalletState = () => {
        setAddress(null);
        setNetwork(null);
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletNetwork');
    };

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!checkWalletInstalled()) {
                throw new Error('Please install Unisat Wallet first!');
            }

            // Force disconnect first to ensure fresh connection
            try {
                await window.unisat.disconnect();
                localStorage.clear(); // Clear all stored wallet data
            } catch (e) {
                console.log('No previous connection to disconnect');
            }

            // Request new connection
            const accounts = await window.unisat.requestAccounts();
            
            if (accounts && accounts.length > 0) {
                const addr = accounts[0];
                
                // Sign message to verify ownership
                const message = `Sign to connect to Bitcoin Space Shooter\nTimestamp: ${Date.now()}`;
                const signature = await window.unisat.signMessage(message);
                
                if (signature) {
                    const net = await window.unisat.getNetwork();
                    setAddress(addr);
                    setNetwork(net);
                    localStorage.setItem('walletConnected', 'true');
                    localStorage.setItem('walletAddress', addr);
                    localStorage.setItem('walletNetwork', net);
                    onWalletConnected(addr, net);
                }
            }
        } catch (err) {
            console.error('Wallet connection error:', err);
            clearWalletState();
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
            localStorage.clear(); // Clear all stored data on error
            if (err instanceof Error && err.message.includes('install')) {
                window.open('https://unisat.io/download', '_blank');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    // Check for existing connection on component mount
    useEffect(() => {
        const checkExistingConnection = async () => {
            const wasConnected = localStorage.getItem('walletConnected') === 'true';
            const savedAddress = localStorage.getItem('walletAddress');
            const savedNetwork = localStorage.getItem('walletNetwork');

            if (wasConnected && savedAddress && savedNetwork && checkWalletInstalled()) {
                try {
                    const accounts = await window.unisat.getAccounts();
                    if (accounts && accounts.length > 0 && accounts[0] === savedAddress) {
                        setAddress(savedAddress);
                        setNetwork(savedNetwork);
                        onWalletConnected(savedAddress, savedNetwork);
                    } else {
                        clearWalletState();
                    }
                } catch (err) {
                    console.error('Error checking existing connection:', err);
                    clearWalletState();
                }
            }
        };

        checkExistingConnection();
    }, [onWalletConnected]);

    return (
        <div className="wallet-connect-container">
            {error && (
                <div className="error-message">
                    {error}
                    {error.includes('install') && (
                        <button 
                            className="install-button"
                            onClick={() => window.open('https://unisat.io/download', '_blank')}
                        >
                            Install Unisat Wallet
                        </button>
                    )}
                </div>
            )}
            
            {!address ? (
                <button 
                    className={`connect-button ${isConnecting ? 'connecting' : ''}`}
                    onClick={connectWallet}
                    disabled={isConnecting}
                >
                    {isConnecting ? 'Connecting...' : 'Connect Unisat Wallet'}
                </button>
            ) : (
                <div className="wallet-info">
                    <span className="address">
                        Connected: {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <span className="network">
                        Network: {network}
                    </span>
                </div>
            )}
        </div>
    );
};

export default WalletConnect;
