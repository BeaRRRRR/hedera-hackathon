import React, { useEffect, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePlaidLink, PlaidLinkError, PlaidLinkOnExitMetadata } from 'react-plaid-link';
import Context from '@/Context';

type Props = {
  bankName: string;
  onSuccess: () => void;
  onExit: () => void;
};

export default function PlaidAutoLink({ bankName, onSuccess, onExit }: Props) {
  const {
    linkToken,
    isPaymentInitiation,
    isCraProductsExclusively,
    dispatch,
  } = useContext(Context);

  const [isLoadingPlaid, setIsLoadingPlaid] = useState(false);
  const [plaidReady, setPlaidReady] = useState(false);
  const [currentLinkToken, setCurrentLinkToken] = useState<string | null>(null);
  const [isTokenReceived, setIsTokenReceived] = useState(false);
  const [isPlaidOverlayVisible, setIsPlaidOverlayVisible] = useState(false);
  const plaidOverlayTimerRef = useRef<number | null>(null);

  // Plaid Link configuration
  const onPlaidSuccess = useCallback(
    (public_token: string) => {
      console.log('🐠🐠🐠🐠', public_token);
      const exchangePublicTokenForAccessToken = async () => {
        try {
        const base = String(import.meta.env.VITE_YUMI_BACKEND_URL || '').replace(/\/$/, '');
        const response = await fetch(`${base}/api/set_access_token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': import.meta.env.VITE_API_KEY,
            },
            body: JSON.stringify({ publicToken: public_token }),
          });
          if (!response.ok) {
            console.error('Failed to exchange public_token');
          }
        } catch (e) {
          console.error('Error exchanging public_token:', e);
        }
      };

      exchangePublicTokenForAccessToken().finally(() => {
        if (plaidOverlayTimerRef.current) {
          clearTimeout(plaidOverlayTimerRef.current);
          plaidOverlayTimerRef.current = null;
        }
        setIsPlaidOverlayVisible(false);
        
        // Force remove Plaid iframe and its container
        const plaidIframe = document.querySelector('iframe[src*="plaid"], iframe#plaid-link-iframe-1');
        if (plaidIframe) {
          plaidIframe.remove();
        }
        
        // Also check for Plaid containers
        const plaidContainer = document.querySelector('[id*="plaid"], [class*="plaid"], body > div:has(iframe[src*="plaid"])');
        if (plaidContainer) {
          plaidContainer.remove();
        }
        
        // Clear body display:none that Plaid might have set
        if (document.body.style.display === 'none') {
          document.body.style.display = '';
        }
        
        try {
          localStorage.setItem('hasConnectedBank', 'true');
        } catch (_e) {
          console.error('Error setting hasConnectedBank:', _e);
        }
        console.log('onSuccess EVERYTHING IS GOOD');
        setTimeout(() => {
          onSuccess();
        }, 100);
      });
    },
    [onSuccess]
  );

  const onPlaidExit = React.useCallback(
    (err: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
      setIsTokenReceived(false);
      setCurrentLinkToken(null);
      if (plaidOverlayTimerRef.current) {
        clearTimeout(plaidOverlayTimerRef.current);
        plaidOverlayTimerRef.current = null;
      }
      setIsPlaidOverlayVisible(false);
      onExit();
    },
    [onExit]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: isTokenReceived ? currentLinkToken : null,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  };

  if (window.location.href.includes('?oauth_state_id=')) {
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready: plaidLinkReady } = usePlaidLink(config);

  // Fetch link token from server on mount
  useEffect(() => {
    let ignore = false;
    const fetchLinkToken = async () => {
      setIsLoadingPlaid(true);
      try {
        const base = String(import.meta.env.VITE_YUMI_BACKEND_URL || '').replace(/\/$/, '');
        const response = await fetch(`${base}/api/create_link_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_API_KEY,
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`Failed to create link token: ${response.status}`);
        }

        const data = await response.json();

        if (ignore) return;

        dispatch({
          type: 'SET_STATE',
          state: {
            linkToken: data.link_token,
          },
        });

        setCurrentLinkToken(data.link_token);
        setIsTokenReceived(true);
      } catch (error) {
        console.error('Error creating link token:', error);
      } finally {
        setIsLoadingPlaid(false);
      }
    };

    fetchLinkToken();
    return () => {
      ignore = true;
    };
  }, [dispatch]);

  // Auto-open Plaid when token is ready
  useEffect(() => {
    if (isTokenReceived && currentLinkToken && plaidLinkReady && open) {
      plaidOverlayTimerRef.current = window.setTimeout(() => {
        setIsPlaidOverlayVisible(true);
      }, 1200);
      setTimeout(() => {
        open();
      }, 100);
    }
    return () => {
      if (plaidOverlayTimerRef.current) {
        clearTimeout(plaidOverlayTimerRef.current);
        plaidOverlayTimerRef.current = null;
      }
    };
  }, [isTokenReceived, currentLinkToken, plaidLinkReady, open]);

  return (
    <>
      {isPlaidOverlayVisible &&
        createPortal(
          <div className="fixed inset-0 z-[9998] bg-white/10 backdrop-blur" />,
          document.body
        )}
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
        <div className="w-full max-w-md mx-4 relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10 p-8 h-[650px] flex flex-col items-center justify-center">
            <div className="text-gray-900 mb-2">Connecting to {bankName}</div>
            <div className="text-gray-500">Launching Plaid Link…</div>
          </div>
        </div>
      </div>
    </>
  );
}
