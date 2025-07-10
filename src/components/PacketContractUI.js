import React, { useState, useEffect } from 'react';
import { getContract, getSignerFromPrivateKey } from '../utils/web3';
import { NETWORKS } from '../contracts/config';
import { useTheme } from '../context/ThemeContext';
import './PacketContractUI.css';
import { Box, Switch, FormControlLabel } from '@mui/material';

// Header Component
const Header = () => (
    <div className="header">
        <h1>Cross-Chain Message Bridge</h1>
        <p>Securely send and receive messages across different blockchain networks</p>
    </div>
);

// Connection Section Component
const ConnectionSection = ({ privateKey, setPrivateKey, selectedNetwork, setSelectedNetwork }) => (
    <div className="card">
        <div className="grid grid-cols-2">
            <div className="form-group">
                <label className="form-label">Private Key</label>
                <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Network</label>
                <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="form-select"
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
);

// Send Message Card Component
const SendMessageCard = ({ 
    destinationChain, 
    setDestinationChain, 
    message, 
    setMessage, 
    loading, 
    sendMessage 
}) => (
    <div className="card">
        <h2 className="card-title">Send Message</h2>
        <div>
            <div className="form-group">
                <label className="form-label">Destination Chain</label>
                <select
                    value={destinationChain}
                    onChange={(e) => setDestinationChain(e.target.value)}
                    className="form-select"
                >
                    <option value="POLYGON_AMOY">Polygon Amoy</option>
                    <option value="ARBITRUM_SEPOLIA">Arbitrum Sepolia</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    rows="3"
                    className="form-textarea"
                />
            </div>
            <button
                onClick={sendMessage}
                disabled={loading}
                className="btn btn-primary"
            >
                {loading ? 'Sending Message...' : 'Send Message'}
            </button>
        </div>
    </div>
);

// Get Message Card Component
const GetMessageCard = ({
    sourceChain,
    setSourceChain,
    packetId,
    setPacketId,
    loading,
    getMessage,
    retrievedMessage
}) => (
    <div className="card">
        <h2 className="card-title">Get Message</h2>
        <div>
            <div className="form-group">
                <label className="form-label">Source Chain</label>
                <select
                    value={sourceChain}
                    onChange={(e) => setSourceChain(e.target.value)}
                    className="form-select"
                >
                    <option value="POLYGON_AMOY">Polygon Amoy</option>
                    <option value="ARBITRUM_SEPOLIA">Arbitrum Sepolia</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Packet ID</label>
                <input
                    type="text"
                    value={packetId}
                    onChange={(e) => setPacketId(e.target.value)}
                    placeholder="Enter packet ID"
                    className="form-input"
                />
            </div>
            <button
                onClick={getMessage}
                disabled={loading}
                className="btn btn-success"
            >
                {loading ? 'Retrieving Message...' : 'Get Message'}
            </button>
            {retrievedMessage && (
                <div className="card">
                    <p className="form-label">Message from {sourceChain}</p>
                    <p className="event-message">{retrievedMessage}</p>
                </div>
            )}
        </div>
    </div>
);

// Events Section Component
const EventsSection = ({ events }) => (
    <div className="card">
        <h2 className="card-title">Recent Events</h2>
        <div className="events-list">
            {events.length === 0 ? (
                <div className="event-item">
                    <p className="event-value">No events found</p>
                </div>
            ) : (
                <div>
                    {events.map((event, index) => (
                        <div key={index} className="event-item">
                            <div className="event-grid">
                                <div>
                                    <p className="event-label">Packet ID</p>
                                    <p className="event-value">{event.packetId}</p>
                                </div>
                                <div>
                                    <p className="event-label">Destination</p>
                                    <p className="event-value">{event.destinationChain}</p>
                                </div>
                                <div className="event-grid">
                                    <p className="event-label">Message</p>
                                    <p className="event-message">{event.message}</p>
                                </div>
                                <div>
                                    <p className="event-label">Message Hash</p>
                                    <p className="event-value">{event.messageHash}</p>
                                </div>
                                <div>
                                    <p className="event-label">Time</p>
                                    <p className="event-value">{event.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// Transaction Hash Component
const TransactionHash = ({ txHash }) => (
    txHash && (
        <div className="tx-hash">
            <p className="event-label">Transaction Hash</p>
            <a 
                href={`https://holesky.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {txHash}
            </a>
        </div>
    )
);

// Error Message Component
const ErrorMessage = ({ error }) => (
    error && (
        <div className="error-message">
            <h3 className="error-title">Error</h3>
            <p className="error-text">{error}</p>
        </div>
    )
);

// Main Component
const PacketContractUI = ({ isDarkMode, onThemeToggle }) => {
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
            if (!privateKey) return;
            
            try {
                const signer = getSignerFromPrivateKey(selectedNetwork, privateKey);
                const contract = getContract(selectedNetwork, signer);
                const address = await signer.getAddress();
                
                return () => {
                    // Cleanup if needed
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
            const contract = getContract(selectedNetwork, signer);
            
            const tx = await contract.sendStringMessage(destinationChain, message);
            setTxHash(tx.hash);
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                setMessage('');
                const address = await signer.getAddress();
                const fromBlock = 0;
                const toBlock = 499;
                
                const filter = contract.filters.PacketSent(address);
                const newEvents = await contract.queryFilter(filter, fromBlock, toBlock);
                
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
            
            const sourceNetwork = sourceChain === 'POLYGON_AMOY' ? 'POLYGON_AMOY' : 'ARBITRUM_SEPOLIA';
            const signer = getSignerFromPrivateKey(sourceNetwork, privateKey);
            const contract = getContract(sourceNetwork, signer);
            
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
        <Box>
            <FormControlLabel
                control={
                    <Switch
                        checked={isDarkMode}
                        onChange={onThemeToggle}
                        color="primary"
                    />
                }
                label="Dark Mode"
            />
            <div className="container">
                <div className="content-wrapper">
                    <Header />
                    <ConnectionSection 
                        privateKey={privateKey}
                        setPrivateKey={setPrivateKey}
                        selectedNetwork={selectedNetwork}
                        setSelectedNetwork={setSelectedNetwork}
                    />
                    <div className="grid grid-cols-2">
                        <SendMessageCard 
                            destinationChain={destinationChain}
                            setDestinationChain={setDestinationChain}
                            message={message}
                            setMessage={setMessage}
                            loading={loading}
                            sendMessage={sendMessage}
                        />
                        <GetMessageCard 
                            sourceChain={sourceChain}
                            setSourceChain={setSourceChain}
                            packetId={packetId}
                            setPacketId={setPacketId}
                            loading={loading}
                            getMessage={getMessage}
                            retrievedMessage={retrievedMessage}
                        />
                    </div>
                    <EventsSection events={events} />
                    <TransactionHash txHash={txHash} />
                    <ErrorMessage error={error} />
                </div>
            </div>
        </Box>
    );
};

export default PacketContractUI; 