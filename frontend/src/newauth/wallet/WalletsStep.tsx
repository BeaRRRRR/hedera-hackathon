import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePrivy, useLinkAccount } from '@privy-io/react-auth';
import { ChevronLeft } from 'lucide-react';
import walletIcon from '@/assets/wallet.svg';
import { fetchWalletUsdBalances } from '@/services/balances';
import { Progress } from '@/components/ui/progress';

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

type LinkedWallet = {
  address: string;
  chainType: 'ethereum' | 'solana';
  walletClientType: string;
};

export default function WalletsStep({ onBack, onContinue }: Props) {
  const { user } = usePrivy();
  const { linkWallet } = useLinkAccount({
    onSuccess: () => {
      // Re-render will pick up new wallet and balances
    },
  });

  const linkedWallets: LinkedWallet[] = useMemo(() => {
    const accounts = user?.linkedAccounts ?? [];
    console.log(accounts);
    return accounts
      .filter((a: unknown) => {
        if (!a || typeof a !== 'object') return false;
        const acc = a as Record<string, unknown>;
        return (
          acc.type === 'wallet' &&
          typeof (acc as any).address === 'string' &&
          (acc as any).walletClientType !== 'privy'
        );
      })
      .map((w: any): LinkedWallet => ({
        address: String(w.address),
        chainType: w.chainType === 'solana' || !String(w.address).startsWith('0x') ? 'solana' : 'ethereum',
        walletClientType: String(w.walletClientType || ''),
      }));
  }, [user?.linkedAccounts]);

  const [walletBalances, setWalletBalances] = useState<Record<string, number>>({});
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
      if (linkedWallets.length === 0) return;
      const now = Date.now();
      const key = walletAddressesKey;
      if (key === lastFetchKeyRef.current && now - lastFetchAtRef.current < FETCH_DEBOUNCE_MS) {
        return;
      }
      try {
        const results = await Promise.all(
          linkedWallets.map(async (w) => {
            try {
              const usd = await fetchWalletUsdBalances(w.address);
              return [w.address, usd.totalUsd] as const;
            } catch {
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
      } catch {
        if (cancelled) return;
        setWalletBalances({});
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [walletAddressesKey, linkedWallets]);

  const shorten = (address: string) =>
    address.length > 10 ? `${address.slice(0, 6)}…${address.slice(address.length - 4)}` : address;

  const hasNonZeroWallet = useMemo(() => {
    return Object.values(walletBalances).some((v) => v > 0);
  }, [walletBalances]);
  const isContinueDisabled = !hasNonZeroWallet;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[720px] flex flex-col">
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-gray-900 text-center">Connected Wallets</h1>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {linkedWallets.length > 0 ? (
              linkedWallets.map((w, index) => (
                <div key={w.address} className="relative flex items-center gap-4 px-4 py-3 bg-white/60 rounded-xl border border-gray-200/50">
                  <div className="relative">
                    <img src={walletIcon} alt={w.walletClientType || 'wallet'} className="w-8 h-8" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                    <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{shorten(w.address)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Hedera Testnet</div>
                  </div>
                  <div className="text-right min-w-0">
                    <div className="text-sm font-bold text-emerald-600 truncate items-center">
                      {w.address in walletBalances ? `$${walletBalances[w.address].toFixed(2)}` : (
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-300 border-t-emerald-500 animate-spin mx-auto" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Available</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">No wallets connected</div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={() => linkWallet()}
              className="w-full group relative overflow-hidden bg-white/60 hover:bg-white/80 text-gray-700 font-medium py-3.5 rounded-xl transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20"
            >
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another wallet
              </span>
            </button>

            <button
              onClick={onContinue}
              disabled={isContinueDisabled}
              className={`w-full group relative overflow-hidden py-3.5 rounded-xl transition-all duration-300 shadow-lg ${
                isContinueDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.02]'
              }`}
            >
              Continue
            </button>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Step 2 of 4</span>
              </div>
              <Progress value={50} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


