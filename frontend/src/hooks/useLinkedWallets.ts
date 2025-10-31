import { usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';

export type LinkedWallet = {
    address: string;
    chainType: 'ethereum' | 'solana';
    walletClientType: string;
};

export const useLinkedWallets = (): LinkedWallet[] => {
    const { user } = usePrivy();

    return useMemo(() => {
        return (user?.linkedAccounts ?? [])
            .filter((acc) => acc.type === 'wallet')
            .map((w) => ({
                address: (w as any).address,
                chainType: (w as any).chainType,
                walletClientType: (w as any).walletClientType,
            }));
    }, [user?.linkedAccounts]);
};

export const useLinkedWalletAddresses = (): string[] => {
    const linkedWallets = useLinkedWallets();
    
    return useMemo(() => {
        return linkedWallets.map((w) => w.address);
    }, [linkedWallets]);
};
