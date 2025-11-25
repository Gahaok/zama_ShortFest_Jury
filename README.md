# ShortFest Jury

A privacy-preserving short film review system powered by FHEVM (Fully Homomorphic Encryption Virtual Machine). This decentralized application enables fair, transparent, and verifiable film judging while maintaining complete privacy of individual jury scores.

## 🎬 Overview

ShortFest Jury leverages homomorphic encryption to allow jurors to submit encrypted scores that can be aggregated on-chain without ever decrypting individual submissions. This ensures:

- **Privacy**: Individual scores remain encrypted and private
- **Transparency**: Aggregation process is verifiable on the blockchain
- **Fairness**: No juror can see others' scores before submitting their own
- **Decentralization**: All data and logic stored on-chain

## ✨ Features

### Core Functionality

- **Encrypted Scoring**: Jurors submit scores encrypted using FHEVM
- **Homomorphic Aggregation**: Scores are aggregated directly on encrypted data
- **Multi-Dimensional Evaluation**: Films are scored on 4 dimensions:
  - Narrative
  - Cinematography
  - Sound
  - Editing
- **Qualification System**: Films meeting threshold criteria are published publicly
- **Role-Based Access**: Separate interfaces for Organizers and Jurors

### Technical Features

- **Dual Mode Support**: 
  - Mock mode for local development with Hardhat
  - Production mode with Zama Relayer SDK
- **EIP-6963 Wallet Support**: Automatic wallet discovery and connection
- **Static Export Ready**: Fully static Next.js export for easy deployment
- **Responsive Design**: Modern UI with dark theme and mobile support

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.24
- **FHEVM** - Fully Homomorphic Encryption Virtual Machine
- **Hardhat** - Development environment

### Frontend
- **Next.js** ^14.2.0 - React framework with static export
- **TypeScript** ^5 - Type safety
- **Tailwind CSS** ^3.4.1 - Styling
- **Ethers.js** ^6.13.0 - Ethereum interaction
- **@zama-fhe/relayer-sdk** ^0.3.0-5 - FHEVM Relayer SDK
- **@fhevm/mock-utils** ^0.3.0-1 - Mock utilities for local development

## 📁 Project Structure

```
zama_ShortFest_Jury/
├── fhevm-hardhat-template/     # Smart contracts and deployment
│   ├── contracts/
│   │   ├── ShortFestJury.sol   # Main contract
│   │   └── FHECounter.sol      # Example contract
│   ├── deploy/
│   │   └── deploy-shortfest.ts # Deployment script
│   ├── test/
│   │   ├── ShortFestJury.test.ts
│   │   └── ShortFestJurySepolia.test.ts
│   └── tasks/
│       └── shortfest.ts        # Hardhat tasks
│
└── shortfest-frontend/         # Next.js frontend
    ├── app/                    # Next.js app directory
    │   ├── page.tsx           # Home page
    │   ├── dashboard/         # Organizer dashboard
    │   ├── review/            # Juror review interface
    │   └── results/           # Public results page
    ├── components/            # React components
    ├── hooks/                 # Custom React hooks
    ├── fhevm/                 # FHEVM integration
    ├── abi/                   # Contract ABIs (generated)
    └── scripts/               # Build and utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Gahaok/zama_ShortFest_Jury.git
cd zama_ShortFest_Jury
```

2. Install dependencies for contracts:
```bash
cd fhevm-hardhat-template
npm install
```

3. Install dependencies for frontend:
```bash
cd ../shortfest-frontend
npm install
```

### Local Development

#### 1. Start Hardhat Node (for mock mode)

In `fhevm-hardhat-template/`:
```bash
npx hardhat node
```

Keep this terminal running.

#### 2. Deploy Contracts

In a new terminal, in `fhevm-hardhat-template/`:
```bash
npx hardhat deploy --network localhost
```

#### 3. Start Frontend (Mock Mode)

In `shortfest-frontend/`:
```bash
npm run dev:mock
```

This will:
- Check if Hardhat node is running
- Generate ABI files from deployments
- Start Next.js dev server with mock FHEVM

#### 4. Start Frontend (Production Mode)

For production mode with Sepolia testnet:
```bash
npm run dev
```

Make sure to:
- Set `NEXT_PUBLIC_SEPOLIA_RPC` environment variable
- Deploy contracts to Sepolia first
- Have Relayer SDK available (loaded from CDN)

## 📖 Usage

### For Organizers

1. **Connect Wallet**: Use the "Connect Wallet" button in the navigation
2. **Access Dashboard**: Navigate to `/dashboard` (only accessible to contract owner)
3. **Add Films**: Submit film metadata (title, director, duration, etc.)
4. **Add Jurors**: Assign jury members by their wallet addresses
5. **Set Qualification Threshold**: Define the minimum average score for qualification
6. **Aggregate Scores**: Once all jurors have submitted, aggregate the encrypted scores
7. **Decrypt Results**: Authorize decryption to view aggregated averages
8. **Publish Results**: Make qualified films and their scores public

### For Jurors

1. **Connect Wallet**: Ensure your wallet is connected
2. **Access Review Page**: Navigate to `/review` (only accessible to assigned jurors)
3. **View Films**: See all films available for review
4. **Submit Scores**: Rate each film on 4 dimensions (0-100 scale)
5. **Add Comments**: Optionally include encrypted comment hashes
6. **View Results**: After aggregation and publication, view public results at `/results`

## 🔧 Development

### Contract Development

```bash
cd fhevm-hardhat-template

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to localhost
npx hardhat deploy --network localhost

# Deploy to Sepolia
npx hardhat deploy --network sepolia
```

### Frontend Development

```bash
cd shortfest-frontend

# Generate ABI files
node scripts/genabi.mjs

# Check static export compliance
npm run check:static

# Build for production
npm run build

# Start production server
npm start
```

### Static Export

The frontend is configured for static export:

```bash
npm run build
# Output will be in `out/` directory
```

The static export can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 🌐 Deployment

### Smart Contracts

1. **Deploy to Sepolia**:
```bash
cd fhevm-hardhat-template
npx hardhat deploy --network sepolia
```

2. **Update Contract Addresses**: The deployment script automatically updates address files, but verify in `shortfest-frontend/abi/ShortFestJuryAddresses.ts`

### Frontend

#### Vercel Deployment

The project includes `vercel.json` configuration:

```bash
cd shortfest-frontend
npm run build
# Deploy `out/` directory to Vercel
```

#### Other Static Hosting

1. Build the static export:
```bash
npm run build
```

2. Deploy the `out/` directory to your hosting service

## 🧪 Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npx hardhat test
```

Tests include:
- Contract deployment
- Juror management
- Film addition
- Encrypted score submission
- Score aggregation
- Result publication

### Frontend Testing

The frontend includes static export validation:
```bash
npm run check:static
```

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys or sensitive credentials
- **Environment Variables**: Use `.env.local` for sensitive configuration
- **Wallet Security**: Always use hardware wallets or secure wallet providers in production
- **FHEVM Keys**: Relayer SDK handles key management; ensure proper configuration

## 📝 Scripts Reference

### Frontend Scripts

- `dev:mock` - Start dev server with mock FHEVM (requires local Hardhat node)
- `dev` - Start dev server with production Relayer SDK
- `build` - Build for production (static export)
- `start` - Start production server
- `lint` - Run ESLint
- `check:static` - Validate static export compliance

### Hardhat Tasks

- `npx hardhat deploy` - Deploy contracts
- `npx hardhat test` - Run test suite
- `npx hardhat compile` - Compile contracts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the contract files for details.

## 🙏 Acknowledgments

- **Zama** - For FHEVM and homomorphic encryption technology
- **Hardhat** - For the excellent development environment
- **Next.js** - For the powerful React framework

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [FHEVM documentation](https://docs.zama.ai/fhevm)
- Review the contract code comments for detailed function documentation

---

Built with ❤️ using FHEVM • Powered by Zama
