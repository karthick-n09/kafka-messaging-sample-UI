import { ethers } from 'ethers';
import PacketContract from '../contracts/PacketContract.json';
import { NETWORKS } from '../contracts/config';

export const getProvider = (network) => {
    return new ethers.JsonRpcProvider(NETWORKS[network].rpcUrl);
};

export const getContract = (network, signer) => {
    const provider = getProvider(network);
    const contractAddress = NETWORKS[network].contractAddress;
    console.log("contractAddress", contractAddress);
    return new ethers.Contract(contractAddress, PacketContract.abi, signer || provider);
};

export const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask!');
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    } catch (error) {
        throw new Error('Error connecting to wallet: ' + error.message);
    }
};

export const switchNetwork = async (network) => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORKS[network].chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            throw new Error(`Please add ${NETWORKS[network].name} network to MetaMask`);
        }
        throw switchError;
    }
};

export const getSignerFromPrivateKey = (network) => {
    const provider = getProvider(network);
    // const privateKey = process.env.REACT_APP_PRIVATE_KEY;
    const privateKey = "0x21b786729922c6c70ce0b6a8615c291811c76fb84c15c142a48f285648078dfe";
    console.log('Private Key:', privateKey); // For debugging
    if (!privateKey) {
        throw new Error('Private key not found in environment variables. Make sure REACT_APP_PRIVATE_KEY is set in .env file');
    }
    return new ethers.Wallet(privateKey, provider);
}; 