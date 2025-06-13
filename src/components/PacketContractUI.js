import React, { useState, useEffect } from 'react';
import { getContract, getSignerFromPrivateKey } from '../utils/web3';
import { NETWORKS } from '../contracts/config';

const PacketContractUI = () => {
    const [message, setMessage] = useState('');
    const [packetId, setPacketId] = useState('');
    const [retrievedMessage, setRetrievedMessage] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('HOLESKY');
    const [destinationChain, setDestinationChain] = useState('POLYGON_AMOY');
    const [sourceChain, setSourceChain] = useState('POLYGON_AMOY');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [txHash, setTxHash] = useState('');

    useEffect(() => {
        const loadEvents = async () => {
            console.log("useEffect");
            if (!privateKey) return;
            
            try {
                const signer = getSignerFromPrivateKey(selectedNetwork, privateKey);
                const contract = getContract(selectedNetwork, signer);
                const address = await signer.getAddress();
                
                // Listen for PacketSent events from the latest block
                // contract.on("PacketSent", (sender, packetId, destinationChain, messageHash, message) => {
                //     if (sender === address) {
                //         setEvents(prevEvents => [...prevEvents, {
                //             packetId: packetId.toString(),
                //             destinationChain: destinationChain,
                //             message: message,
                //             messageHash: messageHash,
                //             timestamp: new Date().toLocaleString()
                //         }]);
                //     }
                // });

                // Clean up listener when component unmounts
                return () => {
                    // contract.removeAllListeners("PacketSent");
                };
            } catch (err) {
                console.error('Error loading events:', err);
                setError('Error loading events. Please try again later.');
            }
        };

        loadEvents();
    }, [privateKey, selectedNetwork]);

    const sendMessage = async () => {
        if (!message || !destinationChain) {
            setError('Please enter a message and select a destination chain');
            return;
        }

        try {
            setError('');
            setLoading(true);
            
            const signer = getSignerFromPrivateKey(selectedNetwork);
            console.log("signer", signer);
            console.log("selectedNetwork", selectedNetwork);
            const contract = getContract(selectedNetwork, signer);
            
            console.log("destinationChain", destinationChain);
            console.log("message", message);
            
            // Send the transaction
            const tx = await contract.sendStringMessage(destinationChain, message);
            // const tx = await contract.sendStringMessage("POLYGON_AMOY", "test message 22");
            console.log('Transaction hash:', tx.hash);
            setTxHash(tx.hash);
            
            // Wait for transaction to be mined
            console.log('Waiting for transaction to be mined...');
            const receipt = await tx.wait();
            console.log('Transaction receipt:', receipt);
            
            if (receipt.status === 1) {
                console.log('Transaction successful');
                setMessage('');
                
                // Refresh events with the same block range
                const address = await signer.getAddress();
                const fromBlock = 0;
                const toBlock = 499; // 0x1f3 in decimal
                
                console.log('Querying blocks from', fromBlock, 'to', toBlock);
                
                const filter = contract.filters.PacketSent(address);
                const newEvents = await contract.queryFilter(
                    filter,
                    fromBlock,
                    toBlock
                );
                
                setEvents(newEvents.map(event => ({
                    packetId: event.args.packetId.toString(),
                    destinationChain: event.args.destinationChain,
                    message: event.args.message,
                    messageHash: event.args.messageHash,
                    timestamp: new Date().toLocaleString()
                })));
            } else {
                throw new Error('Transaction failed');
            }

            return tx.hash;
        } catch (err) {
            console.error('Error sending message:', err);
            if (err.message.includes('user rejected')) {
                setError('Transaction was rejected');
            } else if (err.message.includes('insufficient funds')) {
                setError('Insufficient funds for gas');
            } else {
                setError(err.message);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getMessage = async () => {
        if (!packetId) {
            setError('Please enter a packet ID');
            return;
        }

        try {
            setError('');
            setLoading(true);
            
            // Get contract instance for the source chain
            const sourceNetwork = sourceChain === 'POLYGON_AMOY' ? 'POLYGON_AMOY' : 'ARBITRUM_SEPOLIA';
            const signer = getSignerFromPrivateKey(sourceNetwork, privateKey);
            const contract = getContract(sourceNetwork, signer);
            
            // Call the getMessage function
            const message = await contract.getMessage(packetId);
            setRetrievedMessage(message);
            
        } catch (err) {
            console.error('Error retrieving message:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Cross-Chain Message Bridge
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        Securely send and receive messages across different blockchain networks
                    </p>
                </div>

                {/* Connection Section */}
                <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Private Key
                            </label>
                            <input
                                type="password"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                placeholder="Enter your private key"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Network
                            </label>
                            <select
                                value={selectedNetwork}
                                onChange={(e) => setSelectedNetwork(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            >
                                {Object.keys(NETWORKS).map(network => (
                                    <option key={network} value={network}>
                                        {NETWORKS[network].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                    {/* Send Message Card */}
                    <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Send Message</h2>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Destination Chain
                                </label>
                                <select
                                    value={destinationChain}
                                    onChange={(e) => setDestinationChain(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                >
                                    <option value="POLYGON_AMOY">Polygon Amoy</option>
                                    <option value="ARBITRUM_SEPOLIA">Arbitrum Sepolia</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your message"
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                />
                            </div>

                            <button
                                onClick={sendMessage}
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending Message...' : 'Send Message'}
                            </button>
                        </div>
                    </div>

                    {/* Get Message Card */}
                    <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Get Message</h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Source Chain
                                </label>
                                <select
                                    value={sourceChain}
                                    onChange={(e) => setSourceChain(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                >
                                    <option value="POLYGON_AMOY">Polygon Amoy</option>
                                    <option value="ARBITRUM_SEPOLIA">Arbitrum Sepolia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Packet ID
                                </label>
                                <input
                                    type="text"
                                    value={packetId}
                                    onChange={(e) => setPacketId(e.target.value)}
                                    placeholder="Enter packet ID"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                />
                            </div>

                            <button
                                onClick={getMessage}
                                disabled={loading}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-green-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Retrieving Message...' : 'Get Message'}
                            </button>

                            {retrievedMessage && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Message from {sourceChain}</p>
                                    <p className="text-gray-800 break-words bg-white p-3 rounded border border-gray-100">{retrievedMessage}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Events Section */}
                <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>

                    <div className="border rounded-lg overflow-hidden">
                        {events.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-500">No events found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {events.map((event, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Packet ID</p>
                                                <p className="text-sm text-gray-900">{event.packetId}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Destination</p>
                                                <p className="text-sm text-gray-900">{event.destinationChain}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs font-medium text-gray-500">Message</p>
                                                <p className="text-sm text-gray-900 break-words bg-gray-50 p-2 rounded border border-gray-100">{event.message}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Message Hash</p>
                                                <p className="text-xs text-gray-900 break-all font-mono bg-gray-50 p-1.5 rounded border border-gray-100">{event.messageHash}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">Time</p>
                                                <p className="text-sm text-gray-900">{event.timestamp}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction Hash */}
                {txHash && (
                    <div className="mt-4 bg-white rounded-lg shadow p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-700">Transaction Hash</p>
                        <a 
                            href={`https://holesky.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 break-all transition-colors font-mono"
                        >
                            {txHash}
                        </a>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <h3 className="text-xs font-medium text-red-800">Error</h3>
                        <p className="text-xs text-red-700">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PacketContractUI; 