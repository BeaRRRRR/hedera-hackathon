import { useState } from 'react';
import { Search, ChevronLeft, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const exchanges = [
  { id: 1, name: 'Binance' },
  { id: 2, name: 'Coinbase' },
  { id: 3, name: 'Kraken' },
  { id: 4, name: 'Bybit' },
  { id: 5, name: 'OKX' },
  { id: 6, name: 'KuCoin' },
  { id: 7, name: 'Bitfinex' },
  { id: 8, name: 'Gate.io' },
  { id: 9, name: 'Huobi' },
  { id: 10, name: 'Gemini' },
  { id: 11, name: 'Bitstamp' },
  { id: 12, name: 'Crypto.com' },
];

type Props = {
  onBack: () => void;
  onCEXSelect: (cexName: string) => void;
};

export default function CEXSearch({ onBack, onCEXSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredExchanges = exchanges.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
          <div className="mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4">
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-gray-900 text-center">Select your exchange</h1>
          </div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search exchanges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-3 h-12"
              />
            </div>
          </div>
          <div className="space-y-2 mb-8 max-h-80 overflow-y-auto flex-1">
            {filteredExchanges.length > 0 ? (
              filteredExchanges.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onCEXSelect(ex.name)}
                  className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-300 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                  </div>
                  <span className="flex-1 text-left">{ex.name}</span>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No exchanges found</div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Step 2 of 4</span>
            </div>
            <Progress value={50} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}


