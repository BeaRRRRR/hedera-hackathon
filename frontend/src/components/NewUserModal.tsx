import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, X } from 'lucide-react';
import bankIcon from '@/assets/bank.svg';
import verifyIcon from '@/assets/verify.svg';
import walletIcon from '@/assets/wallet.svg';
import connectedIcon from '@/assets/Connected.svg';

interface NewUserModalProps {
    isOpen: boolean;
    onConnectBank: () => void;
    onVerifyIdentity: () => void;
    onClose: () => void;
    isBankConnected?: boolean;
    isWalletConnected?: boolean;
    isIdentityVerified?: boolean;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({
    isOpen,
    onConnectBank,
    onVerifyIdentity,
    onClose,
    isBankConnected = false,
    isWalletConnected = false,
    isIdentityVerified = false,
}) => {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-[#0B0B0F] text-white border-white/10">
                <DialogHeader className="relative p-6">
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-6 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <DialogTitle className="text-center text-2xl font-bold leading-tight mt-2">
                        <span>Welcome!</span>
                        <br />
                        <span>You're a new user</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <p className="text-center text-white/70 max-w-[380px] mx-auto leading-relaxed mb-6">
                        Choose how you'd like to proceed <br /> with your
                        account setup
                    </p>

                    <Card
                        className={`cursor-pointer transition-all rounded-2xl bg-[#0B0B0F] border ${
                            isIdentityVerified
                                ? 'border-[#C9F299]'
                                : 'border-white/10 hover:bg-[#22271C] hover:border-[#C9F299]'
                        }`}
                        onClick={onVerifyIdentity}
                    >
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <img
                                        src={verifyIcon}
                                        alt="verify"
                                        className="w-10 h-10 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-sm sm:text-base text-white">
                                            Scan your passport with zk
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/60">
                                            Your data stays fully private
                                        </p>
                                    </div>
                                </div>
                                {isIdentityVerified ? (
                                    <img
                                        src={connectedIcon}
                                        alt="connected"
                                        className="w-6 h-6"
                                    />
                                ) : (
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 shrink-0" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connect Bank Option */}
                    <Card
                        className={`cursor-pointer transition-all rounded-2xl bg-[#0B0B0F] border ${
                            isBankConnected
                                ? 'border-[#C9F299]'
                                : 'border-white/10 hover:bg-[#22271C] hover:border-[#C9F299]'
                        }`}
                        onClick={onConnectBank}
                    >
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <img
                                        src={bankIcon}
                                        alt="bank"
                                        className="w-10 h-10 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-sm sm:text-base text-white">
                                            Connect Bank
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/60">
                                            Link your bank account for payments
                                        </p>
                                    </div>
                                </div>
                                {isBankConnected ? (
                                    <img
                                        src={connectedIcon}
                                        alt="connected"
                                        className="w-6 h-6"
                                    />
                                ) : (
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 shrink-0" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connect Wallet Option */}
                    <Card
                        className={`cursor-pointer transition-all rounded-2xl bg-[#0B0B0F] border ${
                            isWalletConnected
                                ? 'border-[#C9F299]'
                                : 'border-white/10 hover:bg-[#22271C] hover:border-[#C9F299]'
                        }`}
                        onClick={() => {}}
                    >
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <img
                                        src={walletIcon}
                                        alt="wallet"
                                        className="w-10 h-10 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-sm sm:text-base text-white">
                                            Crypto Wallet
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/60">
                                            Connect your wallet
                                        </p>
                                    </div>
                                </div>
                                {isWalletConnected ? (
                                    <img
                                        src={connectedIcon}
                                        alt="connected"
                                        className="w-6 h-6"
                                    />
                                ) : (
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 shrink-0" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};
