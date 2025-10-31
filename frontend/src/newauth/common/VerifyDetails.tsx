import { useEffect, useMemo, useState } from 'react';
import { Key } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLinkAccount } from '@privy-io/react-auth';

type Props = { onPasskeyClick: () => void };

type VouchResult = {
  success?: boolean;
  data?: {
    privyId?: string;
    binanceVouch?: {
      firstName?: string;
      lastName?: string;
      street?: string;
      zipCode?: string;
      city?: string;
      country?: string;
      totalBalance?: string;
    };
    revolutVouch?: {
      firstName?: string;
      lastName?: string;
      street?: string;
      zipCode?: string;
      city?: string;
      country?: string;
      birthDate?: string;
      bankAccounts?: Array<{
        id?: string;
        balance?: number;
        currency?: string;
      }>;
      totalBalance?: number;
    };
    etherfiVouch?: {
      totalBalance?: string;
      firstName?: string;
      lastName?: string;
    };
  };
};

export default function VerifyDetails({ onPasskeyClick }: Props) {
  const { linkPasskey } = useLinkAccount({
    onSuccess: () => {
      console.log('[passkey] linked successfully');
      onPasskeyClick();
    },
    onError: (e) => {
      console.error('[passkey] link error', e);
    },
  });
  const [vouchData, setVouchData] = useState<VouchResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('vouch_last_result');
      if (raw) {
        const parsed = JSON.parse(raw) as VouchResult;
        console.log('[vouch] loaded result from sessionStorage:', parsed);
        setVouchData(parsed);
      }
    } catch (_e) {
      // ignore parse/storage errors
    }
  }, []);

  const parsedDetails = useMemo(() => {
    const result = {
      firstName: null as string | null,
      lastName: null as string | null,
      address: null as string | null,
      totalBalance: null as string | null,
    };
    
    const anyData: any = vouchData as any;
    const data = anyData?.data;
    console.log('[VerifyDetails] vouchData:', vouchData);
    console.log('[VerifyDetails] data:', data);
    
    if (!data) {
      console.log('[VerifyDetails] No data in vouchData');
      return result;
    }

    // Get the source from sessionStorage to know which data to use
    const source = sessionStorage.getItem('vouch_source');
    console.log('[VerifyDetails] vouch_source:', source);
    
    let vouchSource: any = null;
    if (source === 'binance') {
      vouchSource = data.binanceVouch;
      console.log('[VerifyDetails] Using binanceVouch:', vouchSource);
    } else if (source === 'revolut') {
      vouchSource = data.revolutVouch;
      console.log('[VerifyDetails] Using revolutVouch:', vouchSource);
    } else if (source === 'etherfi') {
      vouchSource = data.etherfiVouch;
      console.log('[VerifyDetails] Using etherfiVouch:', vouchSource);
    } else {
      // Fallback: try to find any non-null vouch data
      console.log('[VerifyDetails] No source found, trying fallback');
      vouchSource = data.binanceVouch || data.revolutVouch || data.etherfiVouch;
      console.log('[VerifyDetails] Fallback vouchSource:', vouchSource);
    }
    
    if (!vouchSource || typeof vouchSource !== 'object') {
      console.log('[VerifyDetails] No valid vouchSource found');
      return result;
    }

    // Extract firstName
    if (typeof vouchSource.firstName === 'string') {
      result.firstName = vouchSource.firstName;
    }
    
    // Extract lastName
    if (typeof vouchSource.lastName === 'string') {
      result.lastName = vouchSource.lastName;
    }
    
    // Extract address (only Binance and Revolut have address fields)
    const street = typeof vouchSource.street === 'string' ? vouchSource.street : null;
    const city = typeof vouchSource.city === 'string' ? vouchSource.city : null;
    const zip = typeof vouchSource.zipCode === 'string' ? vouchSource.zipCode : null;
    const country = typeof vouchSource.country === 'string' ? vouchSource.country : null;
    const addrParts = [street, city, zip, country].filter(Boolean);
    if (addrParts.length > 0) {
      result.address = addrParts.join(', ');
    }
    
    // Extract totalBalance (convert to string if number)
    if (vouchSource.totalBalance != null) {
      result.totalBalance = String(vouchSource.totalBalance);
    }

    console.log('[VerifyDetails] Final parsed result:', result);
    return result;
  }, [vouchData]);


  const userDetails = [
    { label: 'First name', value: [parsedDetails.firstName, parsedDetails.lastName].filter(Boolean).join(' ') || '—' },
    { label: 'Address', value: parsedDetails.address ?? '—' },
    { label: 'Total balance', value: parsedDetails.totalBalance ?? '—' },
  ];
  
  console.log('[VerifyDetails] userDetails:', userDetails);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
          <div className="mb-6">
            <h1 className="text-gray-900 text-center mb-8">Verify details & add passkey</h1>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            {userDetails.map((detail, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="text-gray-500 mb-1">{detail.label}</div>
                <div className="text-gray-900">{detail.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <button
              onClick={async () => {
                try {
                  await linkPasskey();
                } catch (e) {
                  console.error('[passkey] link error (click)', e);
                } finally {
                  // Navigate even if onSuccess didn't fire due to UI closure
                  onPasskeyClick();
                }
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 mb-8 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
            >
              <Key className="w-5 h-5" />
              <span>Add passkey</span>
            </button>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Step 3 of 4</span>
              </div>
              <Progress value={75} className="h-1.5 bg-green-100 [&>div]:bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


