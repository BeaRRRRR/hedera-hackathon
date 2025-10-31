import { useState, useMemo, useEffect } from 'react';
import { Wallet, Landmark, CreditCard, TrendingUp, ChevronRight, Key } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useLoginWithPasskey, usePrivy, useWallets, useConnectOrCreateWallet, useLogin } from '@privy-io/react-auth';
import BankSearch from './bank/BankSearch';
import CryptoCardSearch from './card/CryptoCardSearch';
import CEXSearch from './cex/CEXSearch';
import VerificationLoading from './common/VerificationLoading';
import VerifyDetails from './common/VerifyDetails';
import AddDataSourcesScreen from './sources/AddDataSourcesScreen';
import AllSetScreen from './common/AllSetScreen';
import PaymentScreen from './payment/PaymentScreen';
import PlaidAutoLink from './bank/PlaidAutoLink';
import WalletsStep from './wallet/WalletsStep';
import VerifyIdentityScreen from './identity/VerifyIdentityScreen';
import WalletVerifyDetails from './common/WalletVerifyDetails';
import VouchVerification from './bank/VouchVerification';
import { launchVouch } from '@/services/vouchService';

type ViewState =
  | 'options'
  | 'existing-other-options'
  | 'bank-search'
  | 'card-search'
  | 'cex-search'
  | 'wallets-step'
  | 'wallet-verify-details'
  | 'verification-loading'
  | 'verify-details'
  | 'verify-identity'
  | 'add-data-sources'
  | 'all-set'
  | 'payment'
  | 'plaid-link'
  | 'vouch-verification';

interface Props {
  onCryptoWalletRequested: () => Promise<void> | void;
}

export default function SignInScreen({ onCryptoWalletRequested }: Props) {
  const { user, connectWallet, authenticated, ready } = usePrivy();
  const [currentView, setCurrentView] = useState<ViewState>('options');
  const [enforceSources, setEnforceSources] = useState(false);
  const [plaidIntent, setPlaidIntent] = useState<{ bankName: string; previousView?: ViewState } | null>(null);
  const [previousViewForWallets, setPreviousViewForWallets] = useState<ViewState>('options');
  const [previousViewForBank, setPreviousViewForBank] = useState<ViewState>('options');
  const [previousViewForCard, setPreviousViewForCard] = useState<ViewState>('options');
  const [previousViewForCEX, setPreviousViewForCEX] = useState<ViewState>('options');
  const [previousViewForVerifyIdentity, setPreviousViewForVerifyIdentity] = useState<ViewState>('options');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [lastConnectedWalletAddress, setLastConnectedWalletAddress] = useState<string | null>(null);
  const [vouchRequestId, setVouchRequestId] = useState<string | null>(null);
  

  
  const { wallets } = useWallets();
  console.log('wallets', wallets);

  const { connectOrCreateWallet } = useConnectOrCreateWallet();
  const { login } = useLogin({
    onComplete: () => {
      const vouchInProgress = sessionStorage.getItem('vouch_in_progress');
      if (vouchInProgress) {
        setCurrentView('vouch-verification');
        return;
      }
      console.log('setCurrentView options');
      setCurrentView('options');
    },
  });

  const hasBankAccount = useMemo(() => {
    if (!user?.linkedAccounts) return false;
    return user.linkedAccounts.some((acc: any) => acc.type === 'bank' || (acc as any).provider === 'plaid');
  }, [user?.linkedAccounts]);

  const isWalletLogin = useMemo(() => {
    if (!user?.linkedAccounts || user.linkedAccounts.length === 0) return false;
    const firstAccount = user.linkedAccounts[0];
    return (firstAccount as any).type === 'wallet';
  }, [user?.linkedAccounts]);

  // Check if returning from Vouch redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('[vouch] mount search params:', window.location.search);
    const vouchReturn = urlParams.get('vouch_return') || sessionStorage.getItem('vouch_in_progress');
    const storedRequestId = sessionStorage.getItem('vouch_request_id');
      if (vouchReturn) {
        console.log('[vouch] return detected', { storedRequestId, currentView });
        if (storedRequestId) {
          setVouchRequestId(storedRequestId);
        sessionStorage.removeItem('vouch_request_id');
      } else {
        console.log('[vouch] no storedRequestId found');
      }
      setCurrentView('vouch-verification');
      // Clean up URL parameter
      window.history.replaceState({}, '', '/auth');
    }
  }, []);

  useEffect(() => {
    console.log('authenticated changed', authenticated);
  }, [authenticated]);

  useEffect(() => {
    console.log('authenticated', authenticated);
    if (ready && !authenticated) {
      login({
        loginMethods: ['google', 'passkey', 'twitter', 'wallet'],
      } as any);
    }
  }, [ready, authenticated]);
  
  useEffect(() => {
    console.log('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (wallets.length > 0 && user) {
      // Do not auto-navigate after authentication; keep user on the main screen
      setEnforceSources(!identityVerified);
    }
  }, [wallets.length, user, identityVerified]);

  const signInOptions = useMemo(
    () => [
      { id: 'bank', label: 'Bank/neobank', icon: Landmark },
      { id: 'crypto-card', label: 'Crypto Card', icon: CreditCard },
      { id: 'cex', label: 'CEX', icon: TrendingUp },
      { id: 'crypto-wallet', label: 'Crypto Wallet', icon: Wallet },
    ],
    []
  );

  const handleOptionClick = async (optionId: string) => {
    if (optionId === 'bank') {
      setCurrentView('bank-search');
      return;
    }
    if (optionId === 'crypto-card') {
      setCurrentView('card-search');
      return;
    }
    if (optionId === 'cex') {
      setCurrentView('cex-search');
      return;
    }
    if (optionId === 'crypto-wallet') {
      try {
        const wallet = await connectOrCreateWallet();
        const walletToUse = wallet ?? wallets[0];
        if (walletToUse && 'loginOrLink' in walletToUse && typeof walletToUse.loginOrLink === 'function') {
          await walletToUse.loginOrLink();
        }
        // remember the connected wallet address to show its balance
        setLastConnectedWalletAddress((walletToUse as any)?.address ?? null);
      } catch (_e) {
        // ignore; user may cancel
      }
      setEnforceSources(!identityVerified);
      setPreviousViewForWallets('options');
      setCurrentView('wallet-verify-details');
    }
  };

  const usBanks = new Set([
    'Chase',
    'Bank of America',
    'Wells Fargo',
    'Citibank',
    'US Bank',
    'PNC Bank',
    'Capital One',
    'TD Bank',
    'Truist Bank',
    'Goldman Sachs',
    'Charles Schwab',
    'American Express',
    'Ally Bank',
    'Discover Bank',
    'Marcus by Goldman Sachs',
    'Chime',
    'SoFi',
  ]);

  const handleBankSelect = async (bankName: string) => {
    if (bankName === 'Revolut') {
      try {
        const privyId = user?.id;
        const requestId = crypto.randomUUID();

        setVouchRequestId(requestId);
        setPreviousViewForBank(currentView);
        // Store in sessionStorage to detect safari on redirect
        sessionStorage.setItem('vouch_in_progress', 'true');
        sessionStorage.setItem('vouch_source', 'revolut');
        sessionStorage.setItem('vouch_request_id', requestId);

        const backend = String(import.meta.env.VITE_YUMI_BACKEND_URL || '').replace(/\/$/, '');
        const webhookBase = `${backend}/underwriting/vouch-revolut`;
        const webhookUrl = `${webhookBase}?privyId=${encodeURIComponent(privyId)}`

        await launchVouch({
          requestId,
          datasourceId: 'd62e0336-0ee9-4a5e-a1b3-b6c209a76efb',
          customerId: '98bffdd0-4b92-4545-9ca8-96dee90c26da',
          inputs: {},
          redirectBackUrl: window.location.origin + '/auth?vouch_return=true',
          webhookUrl,
        });
        // Page will redirect, so this code won't execute
      } catch (error) {
        console.error('Failed to launch vouch:', error);
        alert('Failed to launch vouch');
      }
      return;
    }
    if (usBanks.has(bankName)) {
      setPlaidIntent({ bankName, previousView: currentView });
      setCurrentView('plaid-link');
      return;
    }
    setCurrentView('verification-loading');
  };

  const handleCardSelect = async (cardName: string) => {
    if (cardName.toLowerCase().includes('ether')) {
      try {
        const requestId = crypto.randomUUID();
        const privyId = user?.id;

        setVouchRequestId(requestId);
        setPreviousViewForCard(currentView);
        sessionStorage.setItem('vouch_in_progress', 'true');
        sessionStorage.setItem('vouch_source', 'etherfi');
        sessionStorage.setItem('vouch_request_id', requestId);

        const backend = String(import.meta.env.VITE_YUMI_BACKEND_URL || '').replace(/\/$/, '');
        const webhookBase = `${backend}/underwriting/vouch-etherfi`;
        const webhookUrl = `${webhookBase}?privyId=${encodeURIComponent(privyId)}`
        const datasourceId = String(import.meta.env.VITE_VOUCH_ETHERFI_DATASOURCE_ID || '').trim();
        if (!datasourceId) {
          console.error('Missing VITE_VOUCH_ETHERFI_DATASOURCE_ID');
        }
        await launchVouch({
          requestId,
          datasourceId: datasourceId || 'unknown',
          customerId: '98bffdd0-4b92-4545-9ca8-96dee90c26da',
          inputs: {},
          redirectBackUrl: window.location.origin + '/auth?vouch_return=true',
          webhookUrl,
        });
        return; // redirect follows
      } catch (error) {
        console.error('Failed to launch vouch (Etherfi):', error);
        alert('Failed to launch vouch');
      }
    }
    setCurrentView('verification-loading');
  };

  const handleCEXSelect = async (cexName: string): Promise<void> => {
    if (cexName === 'Binance') {
      console.log('[vouch] Binance selected, launching vouch...');
      try {
        const privyId = user?.id;
        const requestId = crypto.randomUUID();

        const backend = String(import.meta.env.VITE_YUMI_BACKEND_URL || '').replace(/\/$/, '');
        const webhookBase = `${backend}/underwriting/vouch-binance`;
        const webhookUrl = `${webhookBase}?privyId=${encodeURIComponent(privyId)}`

        setVouchRequestId(requestId);
        setPreviousViewForCEX(currentView);
        sessionStorage.setItem('vouch_in_progress', 'true');
        sessionStorage.setItem('vouch_source', 'binance');
        sessionStorage.setItem('vouch_request_id', requestId);

        await launchVouch({
          requestId,
          datasourceId: '589f9ee3-cfe1-470c-9d9a-3b77d3326df9',
          customerId: '98bffdd0-4b92-4545-9ca8-96dee90c26da',
          inputs: { currency: 'USDT' },
          redirectBackUrl: window.location.origin + '/auth?vouch_return=true',
          webhookUrl,
        });
      } catch (error) {
        console.error('Failed to launch vouch (Binance):', error);
        alert('Failed to launch vouch');
      }
      return;
    }
    setCurrentView('verification-loading');
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-gray-600">Loading sign-in…</div>
      </div>
    );
  }

  const handleVerificationComplete = () => {
    setCurrentView('verify-details');
  };

  const handlePasskeyClick = () => {
    setCurrentView('add-data-sources');
  };

  const handleAddSource = (sourceId: string) => {
    if (sourceId === 'crypto-wallet') {
      setPreviousViewForWallets('add-data-sources');
      setCurrentView('wallets-step');
      return;
    }
    if (sourceId === 'bank') {
      setPreviousViewForBank('add-data-sources');
      setCurrentView('bank-search');
      return;
    }
    if (sourceId === 'cex') {
      setPreviousViewForCEX('add-data-sources');
      setCurrentView('cex-search');
      return;
    }
    setCurrentView('all-set');
  };

  const handleAllSetComplete = () => {
    setCurrentView('payment');
  };

  const handleShowOtherOptions = () => {
    setCurrentView('existing-other-options');
  };

  if (currentView === 'bank-search') {
    return (
      <BankSearch
        onBack={() => {
          if (previousViewForBank) {
            setCurrentView(previousViewForBank);
          } else {
            setCurrentView('options');
          }
        }}
        onBankSelect={handleBankSelect}
      />
    );
  }
  if (currentView === 'card-search') {
    return (
      <CryptoCardSearch
        onBack={() => {
          if (previousViewForCard) {
            setCurrentView(previousViewForCard);
          } else {
            setCurrentView('options');
          }
        }}
        onCardSelect={handleCardSelect}
      />
    );
  }
  if (currentView === 'cex-search') {
    return (
      <CEXSearch
        onBack={() => {
          if (previousViewForCEX) {
            setCurrentView(previousViewForCEX);
          } else {
            setCurrentView('options');
          }
        }}
        onCEXSelect={handleCEXSelect}
      />
    );
  }
  if (currentView === 'wallets-step') {
    return (
      <WalletsStep
        onBack={() => setCurrentView(previousViewForWallets)}
        onContinue={() => {
          setEnforceSources(true);
          setCurrentView('add-data-sources');
        }}
      />
    );
  }
  if (currentView === 'wallet-verify-details') {
    return (
      <WalletVerifyDetails
        walletAddress={lastConnectedWalletAddress}
        onBack={() => setCurrentView('options')}
        onContinue={() => {
          setPreviousViewForVerifyIdentity('wallet-verify-details');
          setCurrentView('verify-identity');
        }}
      />
    );
  }
  if (currentView === 'plaid-link' && plaidIntent) {
    return (
      <PlaidAutoLink
        bankName={plaidIntent.bankName}
        onSuccess={() => {
          setIdentityVerified(true);
          setEnforceSources(false);
          setCurrentView('add-data-sources');
        }}
        onExit={() => {
          if (plaidIntent.previousView) {
            setCurrentView(plaidIntent.previousView);
          } else {
            setCurrentView('bank-search');
          }
        }}
      />
    );
  }
  if (currentView === 'verification-loading') {
    return <VerificationLoading onComplete={handleVerificationComplete} />;
  }
  if (currentView === 'verify-details') {
    return <VerifyDetails onPasskeyClick={handlePasskeyClick} />;
  }
  if (currentView === 'verify-identity') {
    return (
      <VerifyIdentityScreen
        onBack={() => {
          if (previousViewForVerifyIdentity) {
            setCurrentView(previousViewForVerifyIdentity);
          } else {
            setCurrentView('options');
          }
        }}
        onPassportScan={() => {
          // ZkMeWidget will handle the verification flow
        }}
        onBankLink={() => {
          setPreviousViewForBank('verify-identity');
          setCurrentView('bank-search');
        }}
        onCEXLink={() => {
          setPreviousViewForCEX('verify-identity');
          setCurrentView('cex-search');
        }}
        onContinue={() => {
          setIdentityVerified(true);
          setEnforceSources(false);
          setCurrentView('add-data-sources');
        }}
      />
    );
  }
  if (currentView === 'add-data-sources') {
    return (
      <AddDataSourcesScreen
        enforceSelection={enforceSources}
        hasBank={hasBankAccount}
        onBack={() => {
          if (identityVerified) {
            setCurrentView('verify-identity');
          } else {
            setCurrentView('verify-details');
          }
        }}
        onSkip={() => setCurrentView('all-set')}
        onAddSource={handleAddSource}
      />
    );
  }
  if (currentView === 'all-set') {
    return <AllSetScreen onComplete={handleAllSetComplete} />;
  }
  if (currentView === 'payment') {
    return <PaymentScreen />;
  }
  if (currentView === 'vouch-verification') {
    return (
      <VouchVerification
        onBack={() => {
          if (previousViewForBank) {
            setCurrentView(previousViewForBank);
          } else {
            setCurrentView('bank-search');
          }
        }}
        onComplete={() => {
          setIdentityVerified(true);
          setEnforceSources(false);
          setCurrentView('verify-details');
        }}
        requestId={vouchRequestId || undefined}
        customerId="98bffdd0-4b92-4545-9ca8-96dee90c26da"
      />
    );
  }
  if (currentView === 'existing-other-options') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
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
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[720px] flex flex-col">
          {/* Existing-user passkey section removed: Privy login is shown earlier */}
          <div className="mt-2 mb-4" />
          <div className="flex-1 flex flex-col">
            <p className="text-emerald-600 text-center mb-4 text-lg font-medium">{authenticated ? 'Continue with:' : 'New user? Sign up with:'}</p>
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


