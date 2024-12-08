// Network Types
export const NETWORK = {
    MAINNET: 'mainnet',
    TESTNET: 'testnet',
} as const;

// Theme Colors
export const COLORS = {
    PRIMARY: '#f7931a',
    SECONDARY: '#4a90e2',
    BACKGROUND: '#000000',
    TEXT: '#ffffff',
    ERROR: '#ff4444',
    SUCCESS: '#00c853',
    WARNING: '#ffb300',
    DISABLED: '#666666',
} as const;

// Pixel Art Theme
export const PIXEL_THEME = {
    FONT_FAMILY: '"Press Start 2P", monospace',
    BORDER_RADIUS: '2px',
    PIXEL_SCALE: 2,
    SHADOW: '2px 2px 0px rgba(0,0,0,0.5)',
    BUTTON_SHADOW: '4px 4px 0px rgba(247,147,26,0.5)',
} as const;

// Avatar Generation
export const AVATAR_CONFIG = {
    COLORS: [
        '#f7931a', // Bitcoin Orange
        '#4a90e2', // Blue
        '#00c853', // Green
        '#ffb300', // Yellow
        '#ff4444', // Red
        '#9c27b0', // Purple
    ],
    SIZE: 8, // 8x8 pixel grid
    SCALE: 4, // Scale up pixels
} as const;

// Game Config
export const GAME_CONFIG = {
    SHIP_TYPES: {
        BASIC: {
            name: 'Basic Ship',
            price: 0,
            speed: 1,
            fireRate: 1,
            color: 0x00ff00,
        },
        SPEED: {
            name: 'Speed Fighter',
            price: 1000,
            speed: 1.5,
            fireRate: 1.2,
            color: 0x00ffff,
        },
        HEAVY: {
            name: 'Heavy Gunner',
            price: 2000,
            speed: 0.8,
            fireRate: 2,
            color: 0xff0000,
        },
    },
    DIFFICULTY_LEVELS: {
        EASY: { enemySpeed: 100, enemySpawnRate: 2000 },
        MEDIUM: { enemySpeed: 150, enemySpawnRate: 1500 },
        HARD: { enemySpeed: 200, enemySpawnRate: 1000 },
    },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    WALLET_CONNECTED: 'walletConnected',
    WALLET_ADDRESS: 'walletAddress',
    WALLET_NETWORK: 'walletNetwork',
    HIGH_SCORE: 'highScore',
    SELECTED_SHIP: 'selectedShip',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    WALLET_NOT_INSTALLED: 'Unisat wallet is not installed',
    CONNECTION_FAILED: 'Failed to connect wallet',
    SIGNATURE_REQUIRED: 'Signature required to connect',
    NETWORK_MISMATCH: 'Please switch to the correct network',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this ship',
} as const;

export enum ChainType {
  BITCOIN_MAINNET = "BITCOIN_MAINNET",
  BITCOIN_TESTNET = "BITCOIN_TESTNET",
  BITCOIN_TESTNET4 = "BITCOIN_TESTNET4",
  BITCOIN_SIGNET = "BITCOIN_SIGNET",
  FRACTAL_BITCOIN_MAINNET = "FRACTAL_BITCOIN_MAINNET",
  FRACTAL_BITCOIN_TESTNET = "FRACTAL_BITCOIN_TESTNET",
}

export enum NetworkType {
  MAINNET,
  TESTNET,
}

type TypeChain = {
  enum: ChainType;
  label: string;
  icon: string;
  unit: string;
  networkType: NetworkType;
  endpoints: string[];
  mempoolSpaceUrl: string;
  unisatUrl: string;
  ordinalsUrl: string;
};

export const CHAINS_MAP: { [key: string]: TypeChain } = {
  [ChainType.BITCOIN_MAINNET]: {
    enum: ChainType.BITCOIN_MAINNET,
    label: "Bitcoin Mainnet",
    icon: "./images/artifacts/bitcoin-mainnet.png",
    unit: "BTC",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space",
    unisatUrl: "https://unisat.io",
    ordinalsUrl: "https://ordinals.com",
  },
  [ChainType.BITCOIN_TESTNET]: {
    enum: ChainType.BITCOIN_TESTNET,
    label: "Bitcoin Testnet",
    icon: "./images/artifacts/bitcoin-testnet.svg",
    unit: "tBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-testnet.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/testnet",
    unisatUrl: "https://testnet.unisat.io",
    ordinalsUrl: "https://testnet.ordinals.com",
  },
  [ChainType.BITCOIN_TESTNET4]: {
    enum: ChainType.BITCOIN_TESTNET4,
    label: "Bitcoin Testnet4 (Beta)",
    icon: "./images/artifacts/bitcoin-testnet.svg",
    unit: "tBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-testnet4.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/testnet4",
    unisatUrl: "https://testnet4.unisat.io",
    ordinalsUrl: "https://testnet4.ordinals.com",
  },
  [ChainType.BITCOIN_SIGNET]: {
    enum: ChainType.BITCOIN_SIGNET,
    label: "Bitcoin Signet",
    icon: "./images/artifacts/bitcoin-signet.svg",
    unit: "sBTC",
    networkType: NetworkType.TESTNET,
    endpoints: ["https://wallet-api-signet.unisat.io"],
    mempoolSpaceUrl: "https://mempool.space/signet",
    unisatUrl: "https://signet.unisat.io",
    ordinalsUrl: "https://signet.ordinals.com",
  },
  [ChainType.FRACTAL_BITCOIN_MAINNET]: {
    enum: ChainType.FRACTAL_BITCOIN_MAINNET,
    label: "Fractal Bitcoin Mainnet",
    icon: "./images/artifacts/fractalbitcoin-mainnet.png",
    unit: "FB",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api-fractal.unisat.io"],
    mempoolSpaceUrl: "https://mempool.fractalbitcoin.io",
    unisatUrl: "https://fractal.unisat.io",
    ordinalsUrl: "https://ordinals.fractalbitcoin.io",
  },
  [ChainType.FRACTAL_BITCOIN_TESTNET]: {
    enum: ChainType.FRACTAL_BITCOIN_TESTNET,
    label: "Fractal Bitcoin Testnet",
    icon: "./images/artifacts/fractalbitcoin-mainnet.png",
    unit: "tFB",
    networkType: NetworkType.MAINNET,
    endpoints: ["https://wallet-api-fractal.unisat.io/testnet"],
    mempoolSpaceUrl: "https://mempool-testnet.fractalbitcoin.io",
    unisatUrl: "https://fractal-testnet.unisat.io",
    ordinalsUrl: "https://ordinals-testnet.fractalbitcoin.io",
  },
};

export type NetworkType = typeof NETWORK[keyof typeof NETWORK];
export type ShipType = keyof typeof GAME_CONFIG.SHIP_TYPES;
