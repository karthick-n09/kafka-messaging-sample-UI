export const NETWORKS = {
    HOLESKY: {
        name: 'Holesky',
        chainId: '0x4268', // 17000
        // rpcUrl: 'https://eth-holesky.g.alchemy.com/v2/oNcQU1hM7hs-V2SUOrqII5DKw_pzeOV3',
        rpcUrl: 'https://clean-nameless-pine.ethereum-holesky.quiknode.pro/7eeabcc8025bd9adf19df540b1f6481a06ac1738/',
        // contractAddress: '0x59Ed8e9Cb1C7D154ffE87f7bb3cBBD868d77D58A'
        contractAddress: '0xAB980Eb150A3B405De4fcd9dD1190716B73d4603'
    },
    POLYGON_AMOY: {
        name: 'Polygon Amoy',
        chainId: '0x13882', // 80002
        rpcUrl: process.env.REACT_APP_POLYGON_AMOY_RPC,
        contractAddress: process.env.REACT_APP_POLYGON_AMOY_CONTRACT
    },
    ARBITRUM_SEPOLIA: {
        name: 'Arbitrum Sepolia',
        chainId: '0x66eee', // 421614
        rpcUrl: process.env.REACT_APP_ARBITRUM_SEPOLIA_RPC,
        contractAddress: process.env.REACT_APP_ARBITRUM_SEPOLIA_CONTRACT
    }
}