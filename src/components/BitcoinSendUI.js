import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';

// Polyfill Buffer after all imports
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// We will derive the address from the WIF to prevent mismatch errors.
// const SENDER_BTC_ADDRESS = 'tb1qfjlup7gzvpsvexxjvzgh677e9e999dwkghxc33';

// WARNING: Never expose real private keys in production!
const SENDER_WIF = 'cNAx5DGZykSSXnT6CJJFr55QeFJfAB5Qq1wfoLXSzBBQK9G5wmee'; // Replace with your actual WIF

const BitcoinSendUI = () => {
    const [btcAmount, setBtcAmount] = useState('');
    const [ethAddress, setEthAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [txHash, setTxHash] = useState('');
    const [balance, setBalance] = useState(null);

    const ADMIN_BTC_ADDRESS = 'tb1qq3sdu7c2q26tqcmflxc6uqhc96mvz0un95sas3';

    // Define Bitcoin testnet network
    const TESTNET = {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
    };

    const { keyPair, SENDER_BTC_ADDRESS } = useMemo(() => {
        try {
            const keyPair = bitcoin.ECPair.fromWIF(SENDER_WIF, TESTNET);
            const { address } = bitcoin.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: TESTNET,
            });
            console.log("Using sender address:", address);
            return { keyPair, SENDER_BTC_ADDRESS: address };
        } catch (e) {
            console.error(e);
            setError(`Invalid WIF: ${e.message}. Make sure SENDER_WIF is a valid testnet private key.`);
            return { keyPair: null, SENDER_BTC_ADDRESS: null };
        }
    }, []);

    // Fetch balance on mount and after sending
    const fetchBalance = async () => {
        if (!SENDER_BTC_ADDRESS) return;
        try {
            console.log("btc sender address : ", SENDER_BTC_ADDRESS);
            const response = await axios.get(
                `https://blockstream.info/testnet/api/address/${SENDER_BTC_ADDRESS}`
            );
            const stats = response.data.chain_stats;
            const total = (stats.funded_txo_sum - stats.spent_txo_sum) / 1e8;
            setBalance(total);
        } catch (err) {
            setBalance(null);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [SENDER_BTC_ADDRESS]);

    const sendBitcoinWithMessage = async () => {
        try {
            if (!keyPair || !SENDER_BTC_ADDRESS) {
                throw new Error("Cannot send transaction, WIF is invalid.");
            }
            if (!ethAddress) {
                throw new Error('Please enter your ETH address');
            }
            if (!btcAmount) {
                throw new Error('Please enter BTC amount');
            }
            if (!ethAddress.startsWith('0x') || ethAddress.length !== 42) {
                throw new Error('Invalid ETH address format');
            }

            // Get UTXOs for sender from BlockCypher
            const utxoResponse = await axios.get(
                `https://api.blockcypher.com/v1/btc/test3/addrs/${SENDER_BTC_ADDRESS}?unspentOnly=true`
            );

            if (!utxoResponse.data.txrefs || utxoResponse.data.txrefs.length === 0) {
                throw new Error('No UTXOs available');
            }

            const utxos = utxoResponse.data.txrefs;
            const psbt = new bitcoin.Psbt({ network: TESTNET });

            // Calculate amounts in satoshis
            const amountInSatoshis = Math.floor(btcAmount * 100000000);
            const feeInSatoshis = 10000; // Increased fee for reliability

            let totalInput = 0;
            for (const utxo of utxos) {
                totalInput += utxo.value;
            }

            if (totalInput < amountInSatoshis + feeInSatoshis) {
                throw new Error('Insufficient funds for transaction');
            }
    
            // Add inputs
            for (const utxo of utxos) {
                const txResponse = await axios.get(`https://api.blockcypher.com/v1/btc/test3/txs/${utxo.tx_hash}`);
                const vout = txResponse.data.outputs[utxo.tx_output_n];

            psbt.addInput({
                    hash: utxo.tx_hash,
                    index: utxo.tx_output_n,
                witnessUtxo: {
                        script: Buffer.from(vout.script, 'hex'),
                        value: utxo.value,
                },
            });
            }

            // Add payment output
            psbt.addOutput({
                address: ADMIN_BTC_ADDRESS,
                value: amountInSatoshis,
            });

            // Add OP_RETURN output with ETH address
            const data = Buffer.from(ethAddress, 'utf8'); // Keep the '0x' prefix
            const embed = bitcoin.payments.embed({ data: [data], network: TESTNET });
            psbt.addOutput({
                script: embed.output,
                value: 0,
            });

            // Add change output if needed
            const changeAmount = totalInput - amountInSatoshis - feeInSatoshis;
            if (changeAmount > 546) { // Dust limit
                psbt.addOutput({
                    address: SENDER_BTC_ADDRESS, // Send change back to sender
                    value: changeAmount,
                });
            }

            // Sign with sender's key
            // const keyPair = bitcoin.ECPair.fromWIF(SENDER_WIF);
            psbt.signAllInputs(keyPair);
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            
            // Broadcast transaction
            const broadcastResponse = await axios.post('https://api.blockcypher.com/v1/btc/test3/txs/push', JSON.stringify({ tx: tx.toHex() }));

            setTxHash(broadcastResponse.data.tx.hash);
            setSuccess(`Transaction sent! Hash: ${broadcastResponse.data.tx.hash}`);
            await fetchBalance(); // Refresh balance after sending
        } catch (err) {
            setError(err.message || 'An unknown error occurred');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Sender Balance: {balance !== null ? `${balance} BTC` : 'Loading...'}
            </Typography>
            <Typography variant="h5" gutterBottom>
                Send bitcoin with ETH Address
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                    Bitcoin Testnet Address to Send To:
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {ADMIN_BTC_ADDRESS}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="BTC Amount"
                    value={btcAmount}
                    onChange={(e) => setBtcAmount(e.target.value)}
                    type="number"
                    placeholder="0.001"
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Your ETH Address (for receiving VCN tokens)"
                    value={ethAddress}
                    onChange={(e) => setEthAddress(e.target.value)}
                    placeholder="0x..."
                    sx={{ mb: 2 }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={sendBitcoinWithMessage}
                    disabled={!ethAddress || !btcAmount}
                    fullWidth
                >
                    Send Bitcoin with ETH Address
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {txHash && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Transaction Hash:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                        {txHash}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        You can check your transaction on{' '}
                        <a href={`https://mempool.space/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                            Mempool Space Testnet Explorer
                        </a>
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default BitcoinSendUI; 