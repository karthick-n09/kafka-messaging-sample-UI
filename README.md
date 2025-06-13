# Packet Contract Scaffold

A simple React-based UI for interacting with the Packet Contract across multiple networks (Holesky, Polygon Amoy, and Arbitrum Sepolia).

## Features

- Connect to MetaMask wallet
- Switch between networks (Holesky, Polygon Amoy, Arbitrum Sepolia)
- Send messages to different chains
- Retrieve messages using packet IDs
- View recent PacketSent events
- Real-time event updates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_POLYGON_AMOY_RPC=your_polygon_amoy_rpc_url
REACT_APP_POLYGON_AMOY_CONTRACT=your_polygon_amoy_contract_address
REACT_APP_ARBITRUM_SEPOLIA_RPC=your_arbitrum_sepolia_rpc_url
REACT_APP_ARBITRUM_SEPOLIA_CONTRACT=your_arbitrum_sepolia_contract_address
```

3. Start the development server:
```bash
npm start
```

## Usage

1. Connect your MetaMask wallet
2. Select the source network (Holesky)
3. Choose a destination chain (Polygon Amoy or Arbitrum Sepolia)
4. Enter your message and send it
5. Use the packet ID to retrieve messages
6. View recent events in the events section

## Network Configuration

The scaffold is configured to work with three networks:
- Holesky (Source Chain)
- Polygon Amoy (Destination Chain)
- Arbitrum Sepolia (Destination Chain)

Make sure you have these networks configured in your MetaMask wallet.

## Contract Functions

The UI provides access to the following contract functions:
- `sendStringMessage`: Send a message to a destination chain
- `getMessage`: Retrieve a message using its packet ID

## Events

The UI automatically displays PacketSent events, showing:
- Packet ID
- Destination Chain
- Message
- Message Hash
- Timestamp 