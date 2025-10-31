import { useEffect, useMemo, useState } from 'react';
import { Wallet as WalletIcon, ChevronLeft, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLinkAccount, usePrivy } from '@privy-io/react-auth';
import { fetchWalletUsdBalances } from '@/services/balances';

type Props = {
  onBack?: () => void;
  onContinue: () => void;
  walletAddress?: string | null;
};

export default function WalletVerifyDetails({ onBack, onContinue, walletAddress }: Props) {
  const { user } = usePrivy();
  const { linkWallet } = useLinkAccount()

  const linkedWallets = useMemo(() => {
    const accounts = user?.linkedAccounts || []
    return accounts
      .filter((acc) => {
        return acc.type === 'wallet' && typeof acc.address === 'string' && acc.walletClientType !== 'privy';
      })
      .map((w: any) => ({
        address: w.address as string,
        walletClientType: String(w.walletClientType || w.connectorType || ''),
      }));
  }, [user?.linkedAccounts]);

  const [addressToUsd, setAddressToUsd] = useState<Record<string, number>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      if (!linkedWallets.length) return;
      setIsLoadingBalances(true);
      try {
        const entries = await Promise.all(
          linkedWallets.map(async (w) => {
      try {
              const res = await fetchWalletUsdBalances(w.address);
              return [w.address.toLowerCase(), Number(res.totalUsd) || 0] as const;
      } catch {
              return [w.address.toLowerCase(), 0] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, number> = {};
          for (const [addr, val] of entries) map[addr] = val;
          setAddressToUsd(map);
        }
      } finally {
        if (!cancelled) setIsLoadingBalances(false);
      }
    };
    loadAll();
    return () => {
      cancelled = true;
    };
  }, [linkedWallets]);

  const hasNonZeroWallet = useMemo(() => {
    return Object.values(addressToUsd).some((v) => v > 0);
  }, [addressToUsd]);

  const shortened = (addr: string) =>
    addr && addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(addr.length - 4)}` : addr;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[720px] flex flex-col">
          <div className="mb-6">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
            <h1 className="text-gray-900 text-center mb-8">Verify details & add wallet</h1>
          </div>

          <div className="space-y-3 mb-8 flex-1 overflow-y-auto pr-1">
            {linkedWallets.length > 0 ? (
              linkedWallets.map((w) => {
                const usd = addressToUsd[w.address.toLowerCase()];
                return (
                  <div key={w.address} className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 bg-white/60">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 truncate">{shortened(w.address)}</div>
                <div className="text-gray-500 mt-1">Hedera network</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 mb-1">Balance</div>
                      {isLoadingBalances && typeof usd === 'undefined' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-300 border-t-emerald-500 animate-spin ml-auto" />
                ) : (
                        <div className="text-gray-900">${Number(usd ?? 0).toFixed(2)}</div>
                )}
              </div>
            </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">No wallets connected</div>
            )}
          </div>

          <div className="mt-auto">
            <button
              onClick={() => linkWallet()}
              className="w-full group relative overflow-hidden bg-white/60 hover:bg-white/80 text-gray-700 font-medium py-3.5 rounded-xl transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 mb-4"
            >
              <span className="relative flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add wallet
              </span>
            </button>

            <button
              onClick={onContinue}
              disabled={!hasNonZeroWallet}
              className={`w-full group relative overflow-hidden py-3.5 rounded-xl transition-all duration-300 shadow-lg mb-6 ${
                !hasNonZeroWallet
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


