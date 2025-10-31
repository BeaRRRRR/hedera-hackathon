// ZkMe Configuration
export const zkMeConfig = {
    // App ID (mchNo) from your ZkMe dashboard
    appId:
        import.meta.env.VITE_ZKME_APP_ID || 'M2025072800226398568220310378945',

    // Chain ID for the blockchain you're integrating with
    chainId: import.meta.env.VITE_ZKME_CHAIN_ID || '1', // Default to Ethereum mainnet

    // Program No from your ZkMe dashboard
    programNo: import.meta.env.VITE_ZKME_PROGRAM_NO || '202507280001',

    // Your DApp name
    dappName: import.meta.env.VITE_ZKME_DAPP_NAME || 'zkMe Frontend',

    // API key for token generation
    apiKey:
        import.meta.env.VITE_ZKME_API_KEY ||
        'afdc2fe0.62f360d4687804e73996b53fb09187e9',

    // Backend API URL for token generation
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};

// Environment validation
export function validateZkMeConfig() {
    const requiredFields = [
        'VITE_ZKME_APP_ID',
        'VITE_ZKME_PROGRAM_NO',
        'VITE_ZKME_API_KEY',
    ];
    const missingFields = requiredFields.filter(
        (field) =>
            !import.meta.env[field] ||
            import.meta.env[field].startsWith('your-')
    );

    if (missingFields.length > 0) {
        console.warn(
            'ZkMe configuration is incomplete. Please set the following environment variables:',
            missingFields
        );
        return false;
    }

    return true;
}

export const chainIds = {
    ethereum: '1',
    polygon: '137',
    bsc: '56',
    arbitrum: '42161',
    optimism: '10',
    avalanche: '43114',
    fantom: '250',
    solana: '101',
    cosmos: 'cosmoshub-4',
    aptos: '1',
    ton: 'mainnet',
} as const;

export type ChainId = (typeof chainIds)[keyof typeof chainIds];
