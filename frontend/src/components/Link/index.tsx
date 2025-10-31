import React, { useEffect, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';

import Context from '../../Context';

const Link = () => {
    const {
        linkToken,
        isPaymentInitiation,
        isCraProductsExclusively,
        dispatch,
    } = useContext(Context);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const onSuccess = useCallback(
        (public_token: string) => {
            // If the access_token is needed, send public_token to server
            console.log('🐠🐠🐠🐠', public_token);
            const exchangePublicTokenForAccessToken = async () => {
                const response = await fetch('/api/set_access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'x-api-key': import.meta.env.VITE_API_KEY,
                    },
                    body: `publicToken=${public_token}`,
                });
                if (!response.ok) {
                    dispatch({
                        type: 'SET_STATE',
                        state: {
                            itemId: `no item_id retrieved`,
                            accessToken: `no access_token retrieved`,
                            isItemAccess: false,
                        },
                    });
                    return;
                }
                const { item_id, access_token } = await response.json();
                dispatch({
                    type: 'SET_STATE',
                    state: {
                        itemId: item_id,
                        accessToken: access_token,
                        isItemAccess: true,
                    },
                });
            };

            // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
            if (isPaymentInitiation) {
                dispatch({ type: 'SET_STATE', state: { isItemAccess: false } });
            } else if (isCraProductsExclusively) {
                // When only CRA products are enabled, only user_token is needed. access_token/public_token exchange is not needed.
                dispatch({ type: 'SET_STATE', state: { isItemAccess: false } });
            } else {
                exchangePublicTokenForAccessToken();
            }

            dispatch({ type: 'SET_STATE', state: { linkSuccess: true } });
            setIsOverlayVisible(false);
            window.history.pushState('', '', '/');
        },
        [dispatch, isPaymentInitiation, isCraProductsExclusively]
    );

    let isOauth = false;
    const config: Parameters<typeof usePlaidLink>[0] = {
        token: linkToken!,
        onSuccess,
        onExit: () => {
            setIsOverlayVisible(false);
        },
    };

    if (window.location.href.includes('?oauth_state_id=')) {
        config.receivedRedirectUri = window.location.href;
        isOauth = true;
    }

    const { open, ready } = usePlaidLink(config);

    return (
        <>
            {isOverlayVisible &&
                createPortal(
                    <div className="fixed inset-0 z-[9998] bg-white/10 backdrop-blur" />,
                    document.body
                )}
            <Button
                onClick={() => {
                    setIsOverlayVisible(true);
                    open();
                }}
                disabled={!ready}
                className="w-full"
                variant="default"
            >
                Launch Link
            </Button>
        </>
    );
};

Link.displayName = 'Link';

export default Link;
