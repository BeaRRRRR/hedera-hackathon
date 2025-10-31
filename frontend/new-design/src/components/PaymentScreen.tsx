import { useState } from 'react';
import { Landmark, Wallet, Check } from 'lucide-react';

export default function PaymentScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'pay-in-4' | 'pay-over-3'>('pay-in-4');
  const [selectedPayment, setSelectedPayment] = useState<'bank' | 'crypto'>('bank');

  const totalAmount = 1200.00;
  const payIn4Amount = (totalAmount / 4).toFixed(2);
  const payOver3Amount = (totalAmount / 3).toFixed(2);

  const plans = [
    {
      id: 'pay-in-4' as const,
      label: 'Pay in 4',
      description: '4 interest-free payments',
      installment: `$${payIn4Amount}`,
      frequency: 'every 2 weeks',
    },
    {
      id: 'pay-over-3' as const,
      label: 'Pay over 3 months',
      description: '3 monthly payments',
      installment: `$${payOver3Amount}`,
      frequency: 'per month',
    },
  ];

  const paymentMethods = [
    {
      id: 'bank' as const,
      label: 'Bank Account',
      description: 'Toss',
      icon: Landmark,
    },
    {
      id: 'crypto' as const,
      label: 'Crypto Wallet',
      description: 'Pay with crypto',
      icon: Wallet,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 min-h-[550px]">
          <div className="mb-8">
            <h1 className="text-gray-900 text-center mb-6">Complete your purchase</h1>
            
            {/* Order Summary */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-200/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Premium Headphones</span>
                <span className="text-gray-900">$1,200.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Plans */}
          <div className="mb-6">
            <div className="text-gray-900 mb-3">Choose your plan</div>
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full p-4 rounded-xl flex items-start gap-3 transition-all duration-300 border-2 ${
                    selectedPlan === plan.id
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-500/20'
                      : 'border-gray-200/50 bg-white/60 backdrop-blur-sm hover:border-gray-300 hover:bg-white/80'
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mt-0.5 transition-colors ${
                    selectedPlan === plan.id
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-900 mb-1">{plan.label}</div>
                    <div className="text-gray-500 mb-2">{plan.description}</div>
                    <div className="text-gray-900">
                      {plan.installment} <span className="text-gray-500">{plan.frequency}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <div className="text-gray-900 mb-3">Payment method</div>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border-2 ${
                      selectedPayment === method.id
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-500/20'
                        : 'border-gray-200/50 bg-white/60 backdrop-blur-sm hover:border-gray-300 hover:bg-white/80'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      selectedPayment === method.id
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors ${
                        selectedPayment === method.id
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-gray-900">{method.label}</div>
                      <div className="text-gray-500">{method.description}</div>
                    </div>
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                      selectedPayment === method.id
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPayment === method.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]">
            Confirm Purchase
          </button>

          {/* Payment Schedule */}
          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
            <div className="text-gray-500 mb-2">First payment today</div>
            <div className="text-gray-900">
              {selectedPlan === 'pay-in-4' ? `$${payIn4Amount}` : `$${payOver3Amount}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
