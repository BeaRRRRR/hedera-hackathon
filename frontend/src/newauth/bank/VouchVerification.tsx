import { useEffect, useRef, useState } from 'react';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { usePrivy } from '@privy-io/react-auth';

type Lock = new () => {
  getStartUrl: (config: {
    requestId: string;
    datasourceId: string;
    customerId: string;
    inputs: Record<string, unknown>;
    redirectBackUrl: string;
    webhookUrl?: string;
  }) => URL;
};

type Props = {
  onBack: () => void;
  onComplete: () => void;
  requestId?: string;
  customerId?: string;
};

export default function VouchVerification({ onBack, onComplete }: Props) {
  const { user } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const pollingRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    const privyId = user?.id;
    if (!privyId) return;

    const controller = new AbortController();

    const poll = async () => {
      attemptsRef.current += 1;
      try {
        const base = import.meta.env.VITE_YUMI_BACKEND_URL;
        const url = `${String(base).replace(/\/$/, '')}/underwriting/get-privy?privyId=${encodeURIComponent(
          String(privyId)
        )}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        console.log('VOUCH VERIFICATION');
        console.log(data);
        sessionStorage.setItem('vouch_last_result', JSON.stringify(data));
        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
          setIsVerified(true);
          setIsLoading(false);
          window.clearInterval(pollingRef.current || 0);
          pollingRef.current = null;
          try {
            sessionStorage.removeItem('vouch_in_progress');
            // Don't remove vouch_source here - VerifyDetails needs it
          } catch(e) {
            console.error('Error removing vouch session storage:', e);
          }
          setTimeout(() => onComplete(), 500);
        }
      } catch(e) {
        console.error('Error polling vouch:', e);
        // ignore network errors between polls
      }
      // safety timeout after ~60s
      if (attemptsRef.current >= 30 && pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsLoading(false);
      }
    };

    pollingRef.current = window.setInterval(poll, 2000);
    poll();

    return () => {
      controller.abort();
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [user?.id, onComplete]);

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
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
            </div>
            <h2 className="text-gray-900 mb-2 text-center">Verification in progress</h2>
            <p className="text-gray-500 text-center">
              {isVerified ? 'Verification complete!' : 'Waiting for verification data...'}
            </p>
          </div>
          <div className="mt-auto space-y-2">
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

