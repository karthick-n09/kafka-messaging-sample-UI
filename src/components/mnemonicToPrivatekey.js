const bip39 = require('bip39');
const bip32 = require('bip32');
const bitcoin = require('bitcoinjs-lib');

const MNEMONIC = 'avoid angry naive avocado puppy erupt aunt sponsor fence trap rotate ski';
const network = bitcoin.networks.testnet;
const path = "m/44'/1'/0'/0/0"; // BIP44 testnet, first account, first address

// 1. Generate seed from mnemonic
const seed = bip39.mnemonicToSeedSync(MNEMONIC);

// 2. Derive root and child node
const root = bip32.fromSeed(seed, network);
const child = root.derivePath(path);

// 3. Get keys and address
const privateKeyHex = child.privateKey.toString('hex');
const publicKeyHex = child.publicKey.toString('hex');
const wif = child.toWIF();
const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network });

console.log('Private Key (hex):', privateKeyHex);
console.log('Public Key (hex):', publicKeyHex);
console.log('WIF:', wif);
console.log('P2WPKH Address:', address);
