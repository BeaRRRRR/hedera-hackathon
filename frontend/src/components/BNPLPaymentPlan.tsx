import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface BNPLPaymentPlanProps {
    totalAmount: number;
    paymentCount?: number;
    paymentInterval?: string;
}

export const BNPLPaymentPlan: React.FC<BNPLPaymentPlanProps> = ({
    totalAmount,
    paymentCount = 4,
    paymentInterval = '2 weeks',
}) => {
    const paymentAmount = Math.round((totalAmount / paymentCount) * 100) / 100;
    const paymentDates = [];

    // Generate payment dates
    for (let i = 0; i < paymentCount; i++) {
        if (i === 0) {
            paymentDates.push('Due today');
        } else {
            const weeks = i * 2;
            paymentDates.push(`In ${weeks} weeks`);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${paymentAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                            Every {paymentInterval}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                            {paymentCount} payments
                        </div>
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Payment Schedule */}
                <div className="space-y-4 mb-6">
                    {paymentDates.map((date, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                {index < paymentCount - 1 && (
                                    <div className="w-px h-6 bg-gray-200 ml-1 mt-2 border-dashed border-gray-300"></div>
                                )}
                            </div>
                            <div className="flex justify-between items-center w-full ml-4">
                                <span className="text-sm text-gray-600">
                                    {date}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    ${paymentAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 mb-4"></div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">APR</div>
                        <div className="text-sm font-medium text-green-600">
                            0%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">
                            Interest
                        </div>
                        <div className="text-sm font-medium text-green-600">
                            Free
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Total</div>
                        <div className="text-sm font-bold text-gray-900">
                            ${totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
