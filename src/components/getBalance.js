const axios = require('axios');

// Replace this with your testnet address
const address = 'tb1qfjlup7gzvpsvexxjvzgh677e9e999dwkghxc33';

// Simple function to get balance
async function getBTCBalance() {
    try {
        const response = await axios.get(`https://blockstream.info/testnet/api/address/${address}`);
        const balance = (response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum) / 100000000;
        console.log(`Balance: ${balance} BTC`);
    } catch (error) {
        console.log('Error:', error.message);
    }
}

// Run it
getBTCBalance();
