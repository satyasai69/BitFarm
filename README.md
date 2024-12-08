
# BTC  Farms (FBTC)


[scrypt-contrcats](https://github.com/satyasai69/BitFarm-contracts)

A decentralized farming protocol built on Bitcoin Ordinals, enabling users to farm and earn yields through Bitcoin inscriptions.

## Overview

BTCOrdinals Farms is a pioneering DeFi protocol that brings yield farming to Bitcoin through Ordinals technology. The protocol allows users to stake their inscriptions, participate in farming pools, and earn rewards in a completely decentralized manner on Bitcoin.

## Key Features


🌎 Virtual Land Ownership (CAT-721 NFTs)
🌾 Farming Mechanics
💰 Play-to-Earn Rewards (CAT-20 Tokens)
🏪 Marketplace Integration
👥 Multiplayer Interactions

## Technology Stack

### Blockchain

- Bitcoin Network
-Fractal Bitcoin (FBT) for recursive inscriptions
- CAT-721 for Land NFTs
- CAT-20 for Reward Tokens
- Unisat Marketplace Integration

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Bitcoin.js
- Ordinals SDK

### Game Development
- Phaser.js 3 for game engine
- Tiled Map Editor for level design
- Texture Packer for sprite management
- WebGL renderer

### Backend
- Node.js
- Express.js
- MongoDB
- Redis for caching
- WebSocket for real-time updates

### Smart Contracts
- Bitcoin Script
- Ordinals Recursive Inscriptions
- Multi-signature Schemes
- [scrypt-contrcats](https://github.com/satyasai69/BitFarm-contracts)
- https://github.com/satyasai69/BitFarm-contracts

## Protocol Architecture


## Farming Mechanics

### Land System

- Each land NFT (CAT-721) has unique properties:
  - Soil Quality (affects crop growth speed)
  - Water Access (determines irrigation needs)
  - Climate Zone (influences suitable crops)
  - Size (determines planting capacity)

### Crop Management

1. Planting

   - Different seed types for various crops
   - Seasonal planting restrictions
   - Soil preparation requirements

2. Growing

   - Growth stages (seedling, mature, harvest-ready)
   - Weather effects on growth
   - Disease and pest management
   - Watering and fertilizing mechanics

3. Harvesting
   - Optimal harvest timing
   - Crop quality factors
   - Harvest tool requirements
   - Yield calculations

### Resource Management

- Tools and Equipment

  - Basic tools (hoe, watering can, etc.)
  - Advanced machinery (tractors, harvesters)
  - Tool durability and maintenance

- Resources
  - Seeds
  - Water
  - Fertilizers
  - Energy points

### Reward System

- Daily farming tasks rewards
- Harvest quality bonuses
- Special event multipliers
- Community farming benefits


## Getting Started

### Prerequisites
```bash
# Install Node.js (v18 or higher)
# Install MongoDB
# Install Redis
```

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

## Smart Contract System

### Farming Contract
```typescript
// Core functionalities
- stakeInscription(): Stake ordinal inscriptions
- unstakeInscription(): Withdraw staked inscriptions
- claimRewards(): Harvest earned yields
- checkRewards(): View pending rewards

// Pool Management
- createPool(): Initialize new farming pool
- updatePool(): Modify pool parameters
- calculateAPY(): Compute current yields
```

### Project Structure
```
src/
├── contracts/     # Bitcoin Script contracts
├── pools/         # Farming pool implementations
├── utils/         # Helper utilities
└── interfaces/    # TypeScript interfaces
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
