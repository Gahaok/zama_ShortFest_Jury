import * as fs from 'fs';
import * as path from 'path';

const CONTRACT_NAME = 'ShortFestJury';
const HARDHAT_DIR = path.resolve('../fhevm-hardhat-template');
const OUT_DIR = path.resolve('./abi');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function readDeployment(chainName, contractName) {
  const deploymentPath = path.join(HARDHAT_DIR, 'deployments', chainName, `${contractName}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.warn(`Deployment not found: ${deploymentPath}`);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
  return {
    address: data.address,
    abi: data.abi,
  };
}

function generateABI() {
  console.log('Generating ABI files...');

  // Read deployments
  const localhost = readDeployment('localhost', CONTRACT_NAME);
  const sepolia = readDeployment('sepolia', CONTRACT_NAME);

  if (!localhost && !sepolia) {
    console.error('❌ No deployments found. Please deploy the contract first.');
    process.exit(1);
  }

  // Use whichever is available for ABI
  const abiSource = localhost || sepolia;

  // Generate ABI file
  const abiContent = `// Auto-generated file - do not edit manually
export const ShortFestJuryABI = ${JSON.stringify(abiSource.abi, null, 2)} as const;
`;

  fs.writeFileSync(path.join(OUT_DIR, 'ShortFestJuryABI.ts'), abiContent);
  console.log('✅ Generated ShortFestJuryABI.ts');

  // Generate addresses file
  const addressesContent = `// Auto-generated file - do not edit manually
export const ShortFestJuryAddresses = {
  localhost: ${localhost ? `'${localhost.address}'` : 'undefined'},
  sepolia: ${sepolia ? `'${sepolia.address}'` : 'undefined'},
} as const;

export type NetworkName = keyof typeof ShortFestJuryAddresses;

export function getContractAddress(chainId: number): string | undefined {
  switch (chainId) {
    case 31337:
      return ShortFestJuryAddresses.localhost;
    case 11155111:
      return ShortFestJuryAddresses.sepolia;
    default:
      return undefined;
  }
}
`;

  fs.writeFileSync(path.join(OUT_DIR, 'ShortFestJuryAddresses.ts'), addressesContent);
  console.log('✅ Generated ShortFestJuryAddresses.ts');

  console.log('✅ ABI generation complete!');
}

try {
  generateABI();
} catch (error) {
  console.error('❌ Error generating ABI:', error);
  process.exit(1);
}


