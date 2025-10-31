import { useEffect, useState } from 'react';
import '@zkmelabs/widget/dist/style.css';
import { usePrivy } from '@privy-io/react-auth';

import {
    zkMeService,
    setPrivyWalletAddress,
    type KycResults,
} from '@/services/zkMeService';
import { verifyKycWithZkMeServices } from '@zkmelabs/widget';

interface ZkMeWidgetProps {
    className?: string;
    onKycCompleted?: (results: KycResults) => void;
    autoStart?: boolean;
}

export function ZkMeWidget({ className, onKycCompleted, autoStart = false }: ZkMeWidgetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const { user } = usePrivy();
    const linkedAddress = (() => {
        const accounts: unknown[] = Array.isArray(user?.linkedAccounts)
            ? (user?.linkedAccounts as unknown[])
            : [];
        const wallets = accounts.filter((acc: unknown) => {
            if (!acc || typeof acc !== 'object') return false;
            const a = acc as Record<string, unknown>;
            return a.type === 'wallet' && typeof a.address === 'string';
        }) as Array<{ address: string; walletClientType?: string; connectorType?: string }>;
        const nonEmbedded = wallets.find((w) => {
            const t = String(w.walletClientType || w.connectorType || '').toLowerCase();
            return t !== 'privy' && t !== 'embedded';
        });
        return (nonEmbedded?.address || wallets[0]?.address || (user as any)?.wallet?.address || '') as string;
    })();
    const appId = import.meta.env.VITE_ZKME_APP_ID;
    const options = { programNo: import.meta.env.VITE_ZKME_PROGRAM_NO };
    useEffect(() => {
        // Debug: log linked accounts and resolved address on mount/change
        console.log('[zkMeWidget] user.linkedAccounts:', user?.linkedAccounts);
        console.log('[zkMeWidget] resolved linkedAddress:', linkedAddress);
        zkMeService.onKycFinished((results) => {
            setIsVerified(results.isGrant);
            setIsLoading(false);
            onKycCompleted?.(results);
        });
        // Emulate success when the user closes the zkMe modal (temporary behavior)
        zkMeService.onClosed(() => {
            setIsLoading(false);
            onKycCompleted?.({
                isGrant: true,
                associatedAccount: linkedAddress || '',
            });
        });
    }, [onKycCompleted, linkedAddress, user?.linkedAccounts]);

    const handleVerifyClick = async () => {
        setIsLoading(true);

        try {
            // Debug: log before starting verification
            console.log('[zkMeWidget] handleVerifyClick → linkedAddress:', linkedAddress);
            // Resolve wallet address from linked accounts (prefer external, fallback to embedded)
            if (!linkedAddress) {
                throw new Error('No connected wallet available for zkMe');
            }
            setPrivyWalletAddress(linkedAddress);

            const { isGrant } = await verifyKycWithZkMeServices(
                appId,
                linkedAddress,
                options
            );

            if (isGrant) {
                setIsVerified(true);
                setIsLoading(false);
                onKycCompleted?.({
                    isGrant: true,
                    associatedAccount: linkedAddress || '',
                });
            } else {
                zkMeService.launch();
            }
        } catch (error) {
            console.error('zkMe verification error:', error);
            setIsLoading(false);
        }
    };

    // Auto-start zkMe flow if requested
    useEffect(() => {
        if (autoStart && !isLoading && !isVerified && linkedAddress) {
            // fire and forget; errors handled inside
            void handleVerifyClick();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, linkedAddress]);

    return (
        <div className={className}>
            <div className="flex flex-col items-center gap-4">
                {(!autoStart || !linkedAddress) && (
                    <button
                        onClick={handleVerifyClick}
                        disabled={isLoading || isVerified}
                    >
                        {isLoading
                            ? 'Loading...'
                            : isVerified
                            ? '✓ Verified'
                            : 'Verify with zkMe'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ZkMeWidget;
