interface Window {
    unisat: {
        requestAccounts: () => Promise<string[]>;
        getAccounts: () => Promise<string[]>;
        getNetwork: () => Promise<string>;
        switchNetwork: (network: string) => Promise<void>;
        getPublicKey: () => Promise<string>;
        getBalance: () => Promise<{
            confirmed: number;
            unconfirmed: number;
            total: number;
        }>;
        signMessage: (message: string, type?: string) => Promise<string>;
        signPsbt: (psbtHex: string) => Promise<string>;
        pushPsbt: (psbtHex: string) => Promise<string>;
        sendBitcoin: (address: string, amount: number) => Promise<string>;
    };
}
