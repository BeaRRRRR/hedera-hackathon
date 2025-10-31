import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface AllSetScreenProps {
  onComplete: () => void;
}

export default function AllSetScreen({ onComplete }: AllSetScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 100);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
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
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h2 className="text-gray-900 text-center mb-8">You're all set</h2>
            
            <div className="w-full">
              <Progress value={progress} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
