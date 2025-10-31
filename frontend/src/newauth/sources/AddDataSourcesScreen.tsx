import { Wallet, TrendingUp, Share2, ChevronRight, Landmark, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

type Props = {
  enforceSelection?: boolean;
  onBack?: () => void;
  onSkip: () => void;
  onAddSource: (sourceId: string) => void;
  hasBank?: boolean;
};

export default function AddDataSourcesScreen({ enforceSelection = false, onBack, onSkip, onAddSource, hasBank = false }: Props) {
  const [hasChosen, setHasChosen] = useState(false);

  const allDataSources = [
    { id: 'crypto-wallet', label: 'Link a wallet', description: 'Connect your wallet', icon: Wallet },
    { id: 'socials', label: 'Link socials', description: 'For more secure access (in case u lose ur passkey)', icon: Share2 },
    { id: 'bank', label: 'Link bank', description: 'Connect your bank account', icon: Landmark },
    { id: 'cex', label: 'CEX', description: 'Link your exchange account', icon: TrendingUp },
  ];

  const dataSources = allDataSources.filter(source => {
    if (source.id === 'bank') {
      return !hasBank;
    }
    return true;
  });

  const handleClick = (id: string) => {
    setHasChosen(true);
    onAddSource(id);
  };

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
            <h1 className="text-gray-900 text-center mb-2">Add more data sources</h1>
            <p className="text-gray-500 text-center">Link additional accounts to get a complete view</p>
          </div>
          <div className="space-y-3 mb-6 flex-1">
            {dataSources.map((source) => {
              const Icon = source.icon as any;
              return (
                <button
                  key={source.id}
                  onClick={() => handleClick(source.id)}
                  className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-300 shadow-sm">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-900">{source.label}</div>
                    <div className="text-gray-500">{source.description}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                </button>
              );
            })}
          </div>
          <div className="mt-auto space-y-6">
            <button
              onClick={() => {
                if (enforceSelection && !hasChosen) return;
                onSkip();
              }}
              className={`w-full bg-white/60 backdrop-blur-sm text-gray-700 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                enforceSelection && !hasChosen
                  ? 'cursor-not-allowed opacity-50 border-gray-300/50'
                  : 'hover:bg-white/80 hover:border-gray-400 border-gray-300/50'
              }`}
            >
              {enforceSelection && !hasChosen ? 'Choose at least one source' : 'Skip for now'}
            </button>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Step 4 of 4</span>
              </div>
              <Progress value={100} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


