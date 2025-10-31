import React, { useState, useEffect, useRef } from 'react';
import { usePrivy, useLinkAccount } from '@privy-io/react-auth';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

import walletIcon from '@/assets/wallet.svg';
import { ArrowLeft, X } from 'lucide-react';
import { fetchWalletUsdBalances } from '@/services/balances';

type LinkedWallet = {
    address: string;
    chainType: 'ethereum' | 'solana';
    walletClientType: string;
};

interface ConnectWalletModalProps {
    isOpen: boolean;
    onConnectWallet: () => void;
    onBack: () => void;
    onClose: () => void;
    onCloseByX?: () => void;
    onSelectWallet?: (address: string) => void;
    isConnected?: boolean;
    onContinue?: () => void;
    onWalletAdded?: () => void;
    canSkip?: boolean;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
    isOpen,
    onConnectWallet,
    onBack,
    onClose,
    onCloseByX,
    onContinue,
    onWalletAdded,
}) => {
    const { user } = usePrivy();
    const { linkWallet } = useLinkAccount({
        onSuccess: ({ user: _user }) => {
            onWalletAdded?.();
            onConnectWallet();
        },
        onError: () => {
            onConnectWallet();
        },
    });
    const [walletBalances, setWalletBalances] = useState<
        Record<string, number>
    >({});

    const linkedWallets: LinkedWallet[] = React.useMemo(() => {
        const accounts: unknown[] = Array.isArray(user?.linkedAccounts)
            ? (user?.linkedAccounts as unknown[])
            : [];
        // const isWalletAccount = (
        //     acc: unknown
        // ): acc is {
        //     type: 'wallet';
        //     address: string;
        //     chainType: 'ethereum' | 'solana';
        //     walletClientType: string;
        // } => {
        //     if (!acc || typeof acc !== 'object') return false;
        //     const a = acc as Record<string, unknown>;
        //     return (
        //         a.type === 'wallet' &&
        //         typeof a.address === 'string' &&
        //         (a.chainType === 'ethereum' || a.chainType === 'solana') &&
        //         typeof a.walletClientType === 'string'
        //     );
        // };
        const isWalletAccount = (acc: unknown): acc is LinkedWallet => {
            if (!acc || typeof acc !== 'object') return false;
            const a = acc as Record<string, unknown>;
            return (
                a.type === 'wallet' &&
                typeof a.address === 'string' &&
                typeof a.walletClientType === 'string'
            );
        };
        return accounts.filter(isWalletAccount).map((w) => ({
            address: w.address,
            // chainType: w.chainType,
            walletClientType: w.walletClientType,
            chainType:
                w.chainType === 'solana' || !w.address.startsWith('0x')
                    ? 'solana'
                    : 'ethereum',
        }));
    }, [user?.linkedAccounts]);

    const lastFetchKeyRef = useRef<string>('');
    const lastFetchAtRef = useRef<number>(0);
    const FETCH_DEBOUNCE_MS = 15_000;

    const walletAddressesKey = linkedWallets
        .map((w) => w.address.toLowerCase())
        .slice()
        .sort()
        .join(',');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!isOpen || linkedWallets.length === 0) return;
            const now = Date.now();
            const key = walletAddressesKey;
            if (
                key === lastFetchKeyRef.current &&
                now - lastFetchAtRef.current < FETCH_DEBOUNCE_MS
            ) {
                return;
            }
            try {
                const results = await Promise.all(
                    linkedWallets.map(async (w) => {
                        try {
                            const usd = await fetchWalletUsdBalances(w.address);
                            return [w.address, usd.totalUsd] as const;
                        } catch (_e) {
                            return [w.address, 0] as const;
                        }
                    })
                );
                if (cancelled) return;
                const map: Record<string, number> = {};
                for (const [addr, usd] of results) {
                    map[addr] = usd;
                }
                setWalletBalances(map);
                lastFetchKeyRef.current = key;
                lastFetchAtRef.current = now;
            } catch (_e) {
                if (cancelled) return;
                setWalletBalances({});
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [isOpen, walletAddressesKey, linkedWallets]);

    const renderWalletIcon = (w: { walletClientType?: string }) => {
        return (
            <img
                src={walletIcon}
                alt={w.walletClientType || 'wallet'}
                className="w-8 h-8 shrink-0"
            />
        );
    };

    const shorten = (address: string) =>
        address.length > 10
            ? `${address.slice(0, 6)}…${address.slice(address.length - 4)}`
            : address;

    const handleAddAnother = () => {
        try {
            onCloseByX?.();
            linkWallet();
        } catch (_e) {
            console.error('Failed to link wallet', _e);
            onConnectWallet();
        }
    };

    const isContinueDisabled = linkedWallets.length === 0;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-gradient-to-br from-[#0B0B0F] to-[#1A1A1F] text-white border border-white/20 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="relative p-6 bg-gradient-to-r from-[#C9F299]/5 to-[#8B5CF6]/5 border-b border-white/10">
                    {/* Back button */}
                    <button
                        type="button"
                        onClick={onBack}
                        className="absolute left-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={() => {
                            onCloseByX();
                        }}
                        className="absolute right-6 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Connected Wallets
                    </DialogTitle>
                </DialogHeader>

                <div
                    className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[60vh]"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(201, 242, 153, 1) transparent',
                    }}
                >
                    <style>{`
                        .overflow-y-auto::-webkit-scrollbar {
                            width: 6px;
                        }
                        .overflow-y-auto::-webkit-scrollbar-track {
                            background: transparent;
                            border-radius: 10px;
                        }
                        .overflow-y-auto::-webkit-scrollbar-thumb {
                            background: #C9F299;
                            border-radius: 10px;
                        }
                        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                            background: #C9F299;
                        }`}
                    </style>
                    {/* Connected wallets list */}
                    {linkedWallets.length > 0 ? (
                        <div className="space-y-3 py-2">
                            <div className="space-y-2">
                                {linkedWallets.map((w, index) => (
                                    <div
                                        key={w.address}
                                        className="group relative"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        <div className="relative flex items-center gap-4 px-4 py-3">
                                            <div className="relative">
                                                {renderWalletIcon(w)}
                                                {/* Status indicator */}
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#C9F299] rounded-full border-2 border-[#121214] shadow-sm" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-semibold text-white truncate">
                                                        {shorten(w.address)}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-white/60 truncate mt-0.5">
                                                    Hedera Testnet
                                                </div>
                                            </div>

                                            <div className="text-right min-w-0">
                                                <div className="text-sm font-bold text-[#C9F299] truncate items-center">
                                                    {w.address in
                                                    walletBalances ? (
                                                        `$${walletBalances[
                                                            w.address
                                                        ].toFixed(2)}`
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-4 h-4 rounded-full border-2 border-[#C9F299]/30 border-t-[#C9F299] animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-white/40 mt-0.5">
                                                    Available
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20">
                                    <img
                                        src={walletIcon}
                                        alt="wallet"
                                        className="w-10 h-10 opacity-50"
                                    />
                                </div>
                                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-dashed border-white/30 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No wallets connected
                            </h3>
                            <p className="text-white/60 text-base max-w-xs mx-auto leading-relaxed">
                                Connect your first wallet to start managing your
                                crypto assets
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                </div>
                <DialogFooter className="flex-1 px-6 pb-6 space-y-6">
                    <div className="space-y-3 pt-4 border-t border-white/10 flex-1">
                        <button
                            type="button"
                            onClick={handleAddAnother}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white font-medium py-3.5 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 hover:shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#C9F299]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Add another wallet
                            </span>
                        </button>

                        {onContinue && (
                            <button
                                type="button"
                                onClick={() => {
                                    onContinue();
                                }}
                                className={`w-full group relative overflow-hidden py-3.5 rounded-xl transition-all duration-300 shadow-lg ${
                                    isContinueDisabled
                                        ? 'bg-gray-600/40 text-white/60 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#C9F299] to-[#b7e57d] hover:from-[#b7e57d] hover:to-[#a6d470] text-black hover:shadow-xl hover:shadow-[#C9F299]/25 hover:scale-[1.02] transform'
                                }`}
                                disabled={isContinueDisabled}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    Continue
                                    <svg
                                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </span>
                            </button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConnectWalletModal;
