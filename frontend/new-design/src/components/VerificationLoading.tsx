import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface VerificationLoadingProps {
  onComplete: () => void;
}

export default function VerificationLoading({ onComplete }: VerificationLoadingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
            </div>
            <h2 className="text-gray-900 mb-2 text-center">Verification in progress</h2>
            <p className="text-gray-500 text-center">(continue in Toss)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
