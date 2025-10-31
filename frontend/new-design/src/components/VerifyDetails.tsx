import { Key } from 'lucide-react';
import { Progress } from './ui/progress';

interface VerifyDetailsProps {
  onPasskeyClick: () => void;
}

export default function VerifyDetails({ onPasskeyClick }: VerifyDetailsProps) {
  const userDetails = [
    { label: 'First name', value: 'John Smith' },
    { label: 'Address', value: '14 Sinchon dae-ro, Seoul, South Korea' },
    { label: 'Date of birth', value: '2004' },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col">
          <div className="mb-6">
            <h1 className="text-gray-900 text-center mb-8">Verify details & add passkey</h1>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            {userDetails.map((detail, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-gray-500 mb-1">{detail.label}</div>
                <div className="text-gray-900">{detail.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <button 
              onClick={onPasskeyClick}
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
