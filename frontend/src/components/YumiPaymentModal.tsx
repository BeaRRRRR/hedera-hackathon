import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface PaymentOption {
    id: string;
    title: string;
    subtitle: string;
    amount: number;
    frequency: string;
    payments: number;
    apr: string;
    interest: string;
    total: number;
    isInterestFree?: boolean;
    scheduleUnit: 'weeks' | 'months';
    scheduleStep: number; // 2 for bi-weekly, 1 for monthly
}

interface YumiPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPay: (selectedOption: PaymentOption) => void;
    totalAmount: number;
    isProcessing?: boolean;
    onShowInsufficientFunds?: () => void;
}

export const YumiPaymentModal: React.FC<YumiPaymentModalProps> = ({
    isOpen,
    onClose,
    onPay,
    totalAmount,
    isProcessing = false,
    onShowInsufficientFunds,
}) => {
    const [selectedOption, setSelectedOption] = useState<string>('pay4over6');

    // Calculate payment options based on total amount
    const interestApr = 0.14; // 14% APR
    const totalWithInterest = totalAmount * (1 + interestApr);

    // Two options per requirements
    const paymentOptions: PaymentOption[] = [
        {
            id: 'pay4over6',
            title: 'Pay in 4',
            subtitle: `$${(totalAmount / 4).toFixed(2)} per payment`,
            amount: totalAmount / 4,
            frequency: 'Every 2 weeks',
            payments: 4,
            apr: '0%',
            interest: 'Free',
            total: totalAmount,
            isInterestFree: true,
            scheduleUnit: 'weeks',
            scheduleStep: 2,
        },
        {
            id: 'pay4over3m',
            title: 'Pay over 3 months',
            subtitle: `$${(totalWithInterest / 4).toFixed(2)} per payment`,
            amount: totalWithInterest / 4,
            frequency: 'Every month',
            payments: 4,
            apr: `${Math.round(interestApr * 100)}%`,
            interest: 'With interest',
            total: totalWithInterest,
            isInterestFree: false,
            scheduleUnit: 'months',
            scheduleStep: 1,
        },
    ];

    const selectedPaymentOption = paymentOptions.find(
        (option) => option.id === selectedOption
    );

    const handlePay = () => {
        if (selectedPaymentOption) {
            onPay(selectedPaymentOption);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="w-[95vw] sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto p-0 rounded-2xl bg-gradient-to-br from-[#0B0B0F] to-[#1A1A1F] text-white border border-white/20 shadow-2xl"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(201, 242, 153, 1) transparent',
                }}
            >
                <DialogHeader className="relative p-4 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-r from-[#C9F299]/5 to-[#8B5CF6]/5 border-b border-white/10">
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-6 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-tight">
                        Choose how to pay ${totalAmount.toFixed(2)}
                    </DialogTitle>
                    <p className="text-center text-white/60 text-sm mt-2">
                        Select your preferred payment plan
                    </p>
                </DialogHeader>
                <style>
                    {`
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

                <div className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Installment options with circle schedule */}
                    {paymentOptions.map((option) => (
                        <Card
                            key={option.id}
                            className={`group cursor-pointer relative overflow-hidden transition-all duration-300 rounded-2xl ${
                                selectedOption === option.id
                                    ? 'border-2 border-[#C9F299] bg-gradient-to-r from-[#22271C] to-[#2A2F22] shadow-lg shadow-[#C9F299]/10'
                                    : 'border border-white/10 bg-gradient-to-r from-[#121214] to-[#1A1A1F] hover:from-[#1A1A1F] hover:to-[#222226] hover:border-[#C9F299]/30 hover:shadow-lg hover:shadow-[#C9F299]/10'
                            }`}
                            onClick={() => setSelectedOption(option.id)}
                        >
                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardContent className="p-3 sm:p-4">
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <h3 className="font-semibold text-sm text-white flex-1">
                                            {option.title}
                                        </h3>
                                        <div
                                            className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                selectedOption === option.id
                                                    ? 'border-[#C9F299] bg-[#C9F299]'
                                                    : 'border-white/30'
                                            }`}
                                        >
                                            {selectedOption === option.id && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-start sm:justify-end gap-4 text-[13px] sm:text-sm text-white/70">
                                        <span>APR {option.apr}</span>
                                        <span>{option.interest}</span>
                                    </div>
                                    <div className="border-t border-white/10 -mx-3 sm:-mx-4" />

                                    {/* Circles with progress */}
                                    <div className="flex flex-row flex-nowrap justify-between gap-2 sm:gap-4">
                                        {(() => {
                                            const isRowSelected =
                                                selectedOption === option.id;
                                            const color = isRowSelected
                                                ? '#C9F299'
                                                : '#CFA9FF';

                                            const renderCircle = (
                                                label: string,
                                                stepIndex: number
                                            ) => {
                                                const progress = Math.max(
                                                    0,
                                                    Math.min(
                                                        1,
                                                        (stepIndex + 1) /
                                                            option.payments
                                                    )
                                                );
                                                const bg = `conic-gradient(${color} ${Math.round(
                                                    progress * 100
                                                )}%, transparent 0)`;
                                                return (
                                                    <div
                                                        key={label}
                                                        className="flex flex-col items-center"
                                                        style={{
                                                            width: `${Math.floor(
                                                                100 / itemCount
                                                            )}%`,
                                                        }}
                                                    >
                                                        <div
                                                            className="relative w-9 h-9 rounded-full"
                                                            style={{
                                                                backgroundImage:
                                                                    bg,
                                                            }}
                                                        >
                                                            <div className="absolute inset-[3px] rounded-full bg-[#141414] flex items-center justify-center">
                                                                <span className="text-xs text-white">
                                                                    {label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-xs text-white">
                                                            $
                                                            {option.amount.toFixed(
                                                                2
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-white/70">
                                                            {(() => {
                                                                if (
                                                                    stepIndex ===
                                                                    0
                                                                )
                                                                    return 'Due today';
                                                                const step =
                                                                    option.scheduleStep;
                                                                const unit =
                                                                    option.scheduleUnit;
                                                                const value =
                                                                    stepIndex *
                                                                    step;
                                                                if (
                                                                    unit ===
                                                                    'weeks'
                                                                ) {
                                                                    return `In ${value} ${
                                                                        value ===
                                                                        1
                                                                            ? 'week'
                                                                            : 'weeks'
                                                                    }`;
                                                                }
                                                                return `In ${value} ${
                                                                    value === 1
                                                                        ? 'month'
                                                                        : 'months'
                                                                }`;
                                                            })()}
                                                        </div>
                                                    </div>
                                                );
                                            };

                                            const nodes: React.ReactNode[] = [];
                                            const itemCount = option.payments;
                                            for (
                                                let i = 0;
                                                i < option.payments;
                                                i++
                                            ) {
                                                nodes.push(
                                                    renderCircle(
                                                        String(i + 1),
                                                        i
                                                    )
                                                );
                                            }
                                            return nodes;
                                        })()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* More options link */}

                    {/* Test button for insufficient funds */}
                    {onShowInsufficientFunds && (
                        <Button
                            onClick={onShowInsufficientFunds}
                            variant="outline"
                            className="w-full mb-2"
                        >
                            Test: Show Insufficient Funds Notice
                        </Button>
                    )}

                    {/* Continue button */}
                    <Button
                        onClick={handlePay}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-[#C9F299] to-[#b7e57d] hover:from-[#b7e57d] hover:to-[#a6d470] disabled:bg-[#7a8a64] text-black font-semibold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#C9F299]/25 hover:scale-[1.02] transform transition-all duration-300"
                        disabled={!selectedPaymentOption || isProcessing}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative">
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing Payment...
                                </div>
                            ) : (
                                'Continue'
                            )}
                        </span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
