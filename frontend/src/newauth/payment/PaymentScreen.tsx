import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Wallet, Check } from 'lucide-react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const { user } = usePrivy();
  const [selectedPlan, setSelectedPlan] = useState<'pay-in-4' | 'pay-over-3'>('pay-in-4');
  const [selectedPayment, setSelectedPayment] = useState<'bank' | 'crypto'>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const totalAmount = 338.99;

  const paymentAmount = totalAmount / 4;
  const interestApr = 0.14;
  const totalWithInterest = totalAmount * (1 + interestApr);

  const plans = [
    { id: 'pay-in-4' as const, label: 'Pay in 4', description: '4 interest-free payments', apr: '0%', interest: 'Free', payments: 4, amount: paymentAmount, frequency: 'Every 2 weeks', total: totalAmount },
    { id: 'pay-over-3' as const, label: 'Pay over 3 months', description: '3 monthly payments', apr: `${Math.round(interestApr * 100)}%`, interest: 'With interest', payments: 4, amount: totalWithInterest / 4, frequency: 'Every month', total: totalWithInterest },
  ];

  const paymentMethods = [
    { id: 'bank' as const, label: 'Bank Account', description: 'Coming soon', icon: Landmark, disabled: true },
    { id: 'crypto' as const, label: 'Crypto Wallet', description: 'Pay with crypto', icon: Wallet, disabled: false },
  ];

  const handleConfirmPurchase = async () => {
    if (selectedPayment === 'bank') {
      alert('Bank payments coming soon!');
      return;
    }

    if (selectedPayment === 'crypto') {
      console.log('user', user?.linkedAccounts);
      console.log('wallets', wallets);
      setIsProcessing(true);
      try {
        if (!wallets || wallets.length === 0) {
          throw new Error('No wallet connected.');
        }

        const embeddedWallet = wallets.find(
          (wallet) => (wallet as unknown as { walletClientType?: string }).walletClientType === 'privy'
        );

        if (!embeddedWallet) {
          throw new Error('No embedded wallet found. Please connect a wallet.');
        }

        // Проверка сети (Hedera Testnet, chainId: 296)
        if (embeddedWallet.chainId !== '296') {
          try {
            await embeddedWallet.switchChain(296);
            console.log('Switched to Hedera Testnet (chainId: 296)');
          } catch (error) {
            console.error('Failed to switch network:', error);
            throw new Error(
              'Пожалуйста, переключитесь на Hedera Testnet (chainId 296).'
            );
          }
        }

        // Параметры транзакции - используем нативный HBAR на Hedera EVM
        const recipientAddress = '0x8675a1C67BD6e644155fC88a8E83Ee84A4a8a8f2';
        const hbarAmount = '4';

        const transaction = {
          to: recipientAddress,
          value: `0x${(parseFloat(hbarAmount) * 1e18).toString(16)}`,
          chainId: 296,
        };

        console.log('Sending HBAR transaction:', transaction);

        const txHash = await sendTransaction(transaction, {
          uiOptions: {
            showWalletUIs: true,
            description: `Send ${hbarAmount} HBAR to complete BNPL order`,
            buttonText: 'Approve Payment',
            transactionInfo: {
              title: 'BNPL Payment Transaction',
              action: 'Buy with BNPL',
            },
            successHeader: 'Payment Complete!',
            successDescription:
              'Your payment has been successfully processed.',
          },
        });

        console.log('Transaction sent, hash:', txHash);
        console.log(
          `HashScan (testnet) link: https://hashscan.io/testnet/tx/${txHash}`
        );

        alert(`Payment successful! Transaction sent on Hedera Testnet`);
        navigate('/products');
      } catch (error) {
        console.error('Payment failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        let userMessage = 'Transaction failed. Please try again.';

        if (errorMessage.includes('Hedera Testnet') || errorMessage.includes('296')) {
          userMessage = 'Please switch to Hedera Testnet (chainId 296).';
        } else if (errorMessage.includes('user rejected')) {
          userMessage = 'Transaction was cancelled. Please try again.';
        } else if (errorMessage.includes('insufficient funds')) {
          userMessage = 'Insufficient funds. Please add HBAR to your wallet.';
        }

        alert(`Payment failed: ${userMessage}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative overflow-hidden">
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg min-h-[550px]">
          <h1 className="text-green-500 text-xl font-semibold text-center mb-4">Complete your purchase</h1>
          <div className="flex justify-center mb-6">
            <span className="text-gray-500 text-sm">Total: <span className="text-gray-900 font-medium">${totalAmount.toFixed(2)}</span></span>
          </div>
          <div className="mb-6">
            <div className="text-gray-900 mb-3">Choose your plan</div>
            <div className="space-y-3">
              {plans.map((plan) => {
                const isRowSelected = selectedPlan === plan.id;
                const color = isRowSelected ? 'green' : 'gray';
                
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-4 rounded-xl transition-all duration-300 border-2 ${
                      selectedPlan === plan.id
                        ? 'border-green-400 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <h3 className="font-semibold text-sm text-gray-900 flex-1">
                          {plan.label}
                        </h3>
                        <div
                          className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isRowSelected
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isRowSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 text-xs text-gray-500">
                        <span>APR {plan.apr}</span>
                        <span>{plan.interest}</span>
                      </div>
                      <div className="border-t border-gray-100" />
                      <div className="flex flex-row flex-nowrap justify-between gap-2">
                        {Array.from({ length: plan.payments }).map((_, i) => {
                          const progress = Math.max(0, Math.min(1, (i + 1) / plan.payments));
                          const bg = `conic-gradient(${isRowSelected ? '#22c55e' : '#9ca3af'} ${Math.round(progress * 100)}%, transparent 0)`;
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div className="relative w-9 h-9 rounded-full" style={{ backgroundImage: bg }}>
                                <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
                                  <span className="text-xs text-gray-900">{i + 1}</span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-900">
                                ${plan.amount.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {i === 0 ? 'Due today' : plan.frequency.toLowerCase()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-8">
            <div className="text-gray-900 mb-3">Payment method</div>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isDisabled = method.disabled;
                return (
                  <button
                    key={method.id}
                    onClick={() => !isDisabled && setSelectedPayment(method.id)}
                    disabled={isDisabled}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 border-2 ${
                      isDisabled
                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        : selectedPayment === method.id
                        ? 'border-green-400 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                      isDisabled ? 'bg-gray-100' : selectedPayment === method.id ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : selectedPayment === method.id ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>{method.label}</div>
                      <div className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{method.description}</div>
                    </div>
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                      isDisabled 
                        ? 'border-gray-200' 
                        : selectedPayment === method.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {!isDisabled && selectedPayment === method.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <button 
            onClick={handleConfirmPurchase}
            disabled={isProcessing || selectedPayment === 'bank'}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isProcessing ? 'Processing Payment...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}


