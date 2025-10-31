import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from '@/components/ui/dialog';

import bankIcon from '@/assets/bank.svg';
import { X } from 'lucide-react';

interface ConnectBankModalProps {
    isOpen: boolean;
    onConnectBank: () => void;
    onSkip: () => void;
    onClose: () => void;
}

export const ConnectBankModal: React.FC<ConnectBankModalProps> = ({
    isOpen,
    onConnectBank,
    onSkip,
    onClose,
}) => {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogOverlay
                style={{ backdropFilter: 'blur(1px)' }}
                className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            />
            <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-gradient-to-br from-[#0B0B0F] to-[#1A1A1F] text-white border border-white/20 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="relative p-6 bg-gradient-to-r from-[#C9F299]/5 to-[#8B5CF6]/5 border-b border-white/10">
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-6 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Connect Your Bank
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-6">
                    <p className="text-center text-white/70 leading-relaxed">
                        Link your bank account to enable seamless payments and
                        faster checkout.
                    </p>

                    {/* Bank Account Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121214] to-[#1A1A1F]">
                        <div className="relative p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={bankIcon}
                                    alt="bank"
                                    className="w-12 h-12 shrink-0"
                                />
                                <div className="min-w-0">
                                    <div className="text-lg font-semibold text-white">
                                        Bank Account
                                    </div>
                                    <div className="text-white/60 text-sm">
                                        Secure connection for payments
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                <button
                                    type="button"
                                    onClick={onConnectBank}
                                    className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C9F299] to-[#b7e57d] hover:from-[#b7e57d] hover:to-[#a6d470] text-black font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#C9F299]/25 hover:scale-[1.02] transform"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative">
                                        Connect Bank
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onSkip}
                                    className="w-full group relative overflow-hidden bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white font-medium py-3.5 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 hover:shadow-lg"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#C9F299]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative">
                                        Skip for now
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConnectBankModal;
