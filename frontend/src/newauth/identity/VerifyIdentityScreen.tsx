import { ScanLine, Landmark, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ZkMeWidget } from '@/components/ZkMeWidget';

type Props = {
  onBack: () => void;
  onPassportScan: () => void;
  onBankLink: () => void;
  onCEXLink: () => void;
  onContinue: () => void;
};

export default function VerifyIdentityScreen({ 
  onBack, 
  onPassportScan, 
  onBankLink, 
  onCEXLink,
  onContinue 
}: Props) {
  const [showZkMe, setShowZkMe] = useState(false);
  const { user } = usePrivy();

  const handlePassportClick = () => {
    setShowZkMe(true);
    onPassportScan();
  };

  const handleZkMeCompleted = () => {
    setShowZkMe(false);
    onContinue();
  };

  if (showZkMe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="w-full max-w-md mx-4 relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
            <div className="mb-6">
              <button
                onClick={() => setShowZkMe(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-gray-900 text-center">Verify your identity</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ZkMeWidget 
                className="w-full"
                onKycCompleted={handleZkMeCompleted}
                autoStart
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options = [
    {
      id: 'passport',
      label: 'Passport scan',
      description: 'Scan your passport for identity verification',
      icon: ScanLine,
      onClick: handlePassportClick,
    },
    {
      id: 'bank',
      label: 'Link bank',
      description: 'Connect your bank account',
      icon: Landmark,
      onClick: onBankLink,
    },
    {
      id: 'cex',
      label: 'Link CEX',
      description: 'Connect your exchange account',
      icon: TrendingUp,
      onClick: onCEXLink,
      disabled: true,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-gray-900 text-center mb-2">Verify your identity</h1>
            <p className="text-gray-500 text-center">Choose a verification method</p>
          </div>
          <div className="space-y-3 mb-6 flex-1">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.onClick}
                  disabled={option.disabled}
                  className={`w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border border-gray-200/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 group hover:scale-[1.02] ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-green-50 group-hover:to-emerald-50 transition-all duration-300 shadow-sm">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-900">{option.label}</div>
                    <div className="text-gray-500">{option.description}</div>
                  </div>
                  {!option.disabled && (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Step 3 of 4</span>
            </div>
            <Progress value={75} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

