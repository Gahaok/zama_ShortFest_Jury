import * as http from 'http';

const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

function checkHardhatNode() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 8545,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        if (res.statusCode === 200 || res.statusCode === 400) {
          // 200 or 400 means the server is responding
          resolve(true);
        } else {
          reject(new Error(`Unexpected status code: ${res.statusCode}`));
        }
      }
    );

    req.on('error', (error) => {
      reject(error);
    });

    // Send a minimal JSON-RPC request
    req.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    }));

    req.end();

    // Timeout after 2 seconds
    setTimeout(() => {
      req.destroy();
      reject(new Error('Connection timeout'));
    }, 2000);
  });
}

console.log('🔍 Checking if Hardhat node is running...');

checkHardhatNode()
  .then(() => {
    console.log('✅ Hardhat node is running at', HARDHAT_RPC_URL);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Hardhat node is not running!');
    console.error('   Please start the node first:');
    console.error('   cd ../fhevm-hardhat-template && npx hardhat node');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  });


