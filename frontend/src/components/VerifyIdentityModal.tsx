import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { ChevronRight, ArrowLeft, X } from 'lucide-react';
import verifyIcon from '@/assets/verify.svg';
import bankIcon from '@/assets/bank.svg';

interface VerifyIdentityModalProps {
    isOpen: boolean;
    onVerifyWithZkMe: () => void;
    onVerifyWithBank: () => void;
    onBack: () => void;
    onClose: () => void;
}

export const VerifyIdentityModal: React.FC<VerifyIdentityModalProps> = ({
    isOpen,
    onVerifyWithZkMe,
    onVerifyWithBank,
    onBack,
    onClose,
}) => {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
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
                        onClick={onClose}
                        className="absolute right-6 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                        Verify your identity
                    </DialogTitle>
                    <p className="text-center text-white/60 text-sm mt-2">
                        Choose your preferred verification method
                    </p>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-4 flex flex-col items-center justify-center h-[100%] ">
                    {/* zkMe option */}
                    <button
                        type="button"
                        onClick={onVerifyWithZkMe}
                        className="w-full text-left group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#121214] to-[#1A1A1F] hover:from-[#1A1A1F] hover:to-[#222226] transition-all duration-300 hover:border-[#C9F299]/30 hover:shadow-lg hover:shadow-[#C9F299]/10"
                    >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative p-4 sm:p-5 flex items-center gap-4">
                            <img
                                src={verifyIcon}
                                alt="zkMe"
                                className="w-12 h-12 shrink-0 transition-all duration-200 group-hover:[filter:hue-rotate(60deg)_saturate(3)_brightness(1.5)]"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-xl font-semibold tracking-tight text-white">
                                    Verify Your Identity
                                </div>
                                <div className="text-white/60 text-base leading-snug">
                                    Complete identity verification
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/50 shrink-0 group-hover:text-[#C9F299] group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                    </button>

                    {/* Bank option */}
                    <button
                        type="button"
                        onClick={onVerifyWithBank}
                        className="w-full text-left group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#121214] to-[#1A1A1F] hover:from-[#1A1A1F] hover:to-[#222226] transition-all duration-300 hover:border-[#C9F299]/30 hover:shadow-lg hover:shadow-[#C9F299]/10"
                    >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative p-4 sm:p-5 flex items-center gap-4">
                            <img
                                src={bankIcon}
                                alt="bank"
                                className="w-12 h-12 shrink-0 transition-all duration-200 group-hover:[filter:hue-rotate(60deg)_saturate(3)_brightness(1.5)]"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-xl font-semibold tracking-tight text-white">
                                    Connect Bank
                                </div>
                                <div className="text-white/60 text-base leading-snug">
                                    Link your bank account for payments
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/50 shrink-0 group-hover:text-[#C9F299] group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VerifyIdentityModal;
