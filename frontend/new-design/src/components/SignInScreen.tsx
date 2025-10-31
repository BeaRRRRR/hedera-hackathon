import { useState } from 'react';
import { Wallet, Landmark, CreditCard, TrendingUp, ChevronRight, Key } from 'lucide-react';
import { Progress } from './ui/progress';
import BankSearch from './BankSearch';
import CryptoCardSearch from './CryptoCardSearch';
import CEXSearch from './CEXSearch';
import VerificationLoading from './VerificationLoading';
import VerifyDetails from './VerifyDetails';
import AddDataSourcesScreen from './AddDataSourcesScreen';
import AllSetScreen from './AllSetScreen';
import PaymentScreen from './PaymentScreen';
import { Separator } from './ui/separator';

export default function SignInScreen() {
  const [currentView, setCurrentView] = useState<'options' | 'existing-other-options' | 'bank-search' | 'card-search' | 'cex-search' | 'verification-loading' | 'verify-details' | 'add-data-sources' | 'all-set' | 'payment'>('options');

  const signInOptions = [
    {
      id: 'bank',
      label: 'Bank/neobank',
      icon: Landmark,
    },
    {
      id: 'crypto-card',
      label: 'Crypto Card',
      icon: CreditCard,
    },
    {
      id: 'cex',
      label: 'CEX',
      icon: TrendingUp,
    },
    {
      id: 'crypto-wallet',
      label: 'Crypto Wallet',
      icon: Wallet,
    },
  ];

  const handleOptionClick = (optionId: string) => {
    if (optionId === 'bank') {
      setCurrentView('bank-search');
    } else if (optionId === 'crypto-card') {
      setCurrentView('card-search');
    } else if (optionId === 'cex') {
      setCurrentView('cex-search');
    }
  };

  const handleBankSelect = (bankName: string) => {
    setCurrentView('verification-loading');
  };

  const handleCardSelect = (cardName: string) => {
    setCurrentView('verification-loading');
  };

  const handleCEXSelect = (cexName: string) => {
    setCurrentView('verification-loading');
  };

  const handleVerificationComplete = () => {
    setCurrentView('verify-details');
  };

  const handlePasskeyClick = () => {
    setCurrentView('add-data-sources');
  };

  const handleSkipDataSources = () => {
    setCurrentView('all-set');
  };

  const handleAddDataSource = (sourceId: string) => {
    // For now, just skip to all-set screen
    // In a real app, this would handle linking the data source
    setCurrentView('all-set');
  };

  const handleAllSetComplete = () => {
    setCurrentView('payment');
  };

  const handlePasskeySignIn = () => {
    // For existing users with passkey, skip directly to payment
    setCurrentView('payment');
  };

  const handleShowOtherOptions = () => {
    setCurrentView('existing-other-options');
  };

  if (currentView === 'bank-search') {
    return <BankSearch onBack={() => setCurrentView('options')} onBankSelect={handleBankSelect} />;
  }

  if (currentView === 'card-search') {
    return <CryptoCardSearch onBack={() => setCurrentView('options')} onCardSelect={handleCardSelect} />;
  }

  if (currentView === 'cex-search') {
    return <CEXSearch onBack={() => setCurrentView('options')} onCEXSelect={handleCEXSelect} />;
  }

  if (currentView === 'verification-loading') {
    return <VerificationLoading onComplete={handleVerificationComplete} />;
  }

  if (currentView === 'verify-details') {
    return <VerifyDetails onPasskeyClick={handlePasskeyClick} />;
  }

  if (currentView === 'add-data-sources') {
    return <AddDataSourcesScreen onSkip={handleSkipDataSources} onAddSource={handleAddDataSource} />;
  }

  if (currentView === 'all-set') {
    return <AllSetScreen onComplete={handleAllSetComplete} />;
  }

  if (currentView === 'payment') {
    return <PaymentScreen />;
  }

  if (currentView === 'existing-other-options') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="w-full max-w-md mx-4 relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('options')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                <span>Back</span>
              </button>
              <h1 className="text-gray-900 text-center">Other sign in options</h1>
            </div>

            <div className="space-y-3 flex-1">
              {signInOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 group hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-300 shadow-sm">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                    </div>
                    <span className="flex-1 text-left">{option.label}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
          {/* Existing User Section */}
          <div className="mb-6">
            <p className="text-gray-500 text-center mb-4">Existing user?</p>
            <button
              onClick={handlePasskeySignIn}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 mb-3 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
            >
              <Key className="w-5 h-5" />
              <span>Sign in with passkey</span>
            </button>
            <button
              onClick={handleShowOtherOptions}
              className="w-full text-gray-600 hover:text-gray-900 p-2 transition-colors duration-200 underline underline-offset-4"
            >
              Other options
            </button>
          </div>

          <Separator className="mt-3 mb-6" />

          {/* New User Section */}
          <div className="flex-1 flex flex-col">
            <p className="text-gray-500 text-center mb-4">New user? Sign up with:</p>

            <div className="space-y-3 flex-1">
              {signInOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 group hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-300 shadow-sm">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                    </div>
                    <span className="flex-1 text-left">{option.label}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Step 1 of 4</span>
              </div>
              <Progress value={25} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
