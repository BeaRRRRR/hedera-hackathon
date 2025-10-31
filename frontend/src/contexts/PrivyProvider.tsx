import React from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { defineChain } from 'viem';

interface PrivyProviderProps {
    children: React.ReactNode;
}

const hederaTestnet = defineChain({
    id: 296,
    name: 'Hedera Testnet',
    network: 'hedera-testnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://testnet.hashio.io/api'] },
    },
    blockExplorers: {
        default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
    },
});

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
    return (
        <PrivyProviderBase
            appId={import.meta.env.VITE_PRIVY_APP_ID}
            config={{
                defaultChain: hederaTestnet,
                supportedChains: [hederaTestnet],
            }}
            
        >
            {children}
        </PrivyProviderBase>
    );
};
