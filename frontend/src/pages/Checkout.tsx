import React, { useState, useEffect, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import {
    ArrowLeft,
    CreditCard,
    Shield,
    Calendar,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    usePrivy,
    useSendTransaction,
    useLogin,
    useCreateWallet,
} from '@privy-io/react-auth';
import { NewUserModal } from '@/components/NewUserModal';
import { ConnectBankModal } from '@/components/ConnectBankModal';
import { ConnectWalletModal } from '@/components/ConnectWalletModal';
import { VerifyIdentityModal } from '@/components/VerifyIdentityModal';
import {
    zkMeService,
    setPrivyWalletAddress,
    type KycResults,
} from '@/services/zkMeService';
import { YumiPaymentModal } from '@/components/YumiPaymentModal';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import SignInScreen from '@/newauth/SignInScreen';
import Context from '@/Context';
import {
    usePlaidLink,
    PlaidLinkError,
    PlaidLinkOnExitMetadata,
} from 'react-plaid-link';
import { verifyKycWithZkMeServices } from '@zkmelabs/widget';

import {useSignAndSendTransaction, useWallets} from '@privy-io/react-auth/solana';
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
    Transaction,
} from '@solana/web3.js';

export const Checkout = () => {
    const { state, clearCart } = useCart();
    const { dispatch: orderDispatch } = useOrder();
    const navigate = useNavigate();
    const {
        ready,
        authenticated,
        user,
        login: privyLogin,
        logout,
        linkWallet,
    } = usePrivy();
    const { wallets } = useWallets();
    const { signAndSendTransaction } = useSignAndSendTransaction();
    const { sendTransaction } = useSendTransaction();
    const { createWallet } = useCreateWallet();
    const embeddedWallet = wallets.find(
        (wallet) => (wallet as unknown as { walletClientType?: string }).walletClientType === 'privy'
    );
    const embeddedWalletReady = !!embeddedWallet;
    const { dispatch, linkToken } = useContext(Context);
    const [isLoadingPlaid, setIsLoadingPlaid] = useState(false);
    const [plaidReady, setPlaidReady] = useState(false);
    const [currentLinkToken, setCurrentLinkToken] = useState<string | null>(
        null
    );
    const [isTokenReceived, setIsTokenReceived] = useState(false);
    const [isPlaidOverlayVisible, setIsPlaidOverlayVisible] = useState(false);
    const [isZkMeOverlayVisible, setIsZkMeOverlayVisible] = useState(false);
    const [userResponse, setUserResponse] = useState({})
    const plaidOverlayTimerRef = useRef<number | null>(null);
   
    const [isWalletLogin, setIsWalletLogin] = useState<boolean>(() => {
        try {
            return sessionStorage.getItem('privy_last_login_type') === 'wallet';
        } catch {
            // console.error(err);
            return false;
        }
    });
    const [walletJustConnected, setWalletJustConnected] = useState(false);
    const [afterVerifyFlow, setAfterVerifyFlow] = useState(false);
    const [wasAddingWallet, setWasAddingWallet] = useState(false);
    const [plaidLaunchedFrom, setPlaidLaunchedFrom] = useState<
        'first-modal' | 'third-modal' | null
    >(null);

    const [hasCompletedVerificationFlow, setHasCompletedVerificationFlow] =
        useState(false);

    const { login: loginWithCallback } = useLogin({
        onComplete: ({ loginAccount }) => {
            const isWallet = loginAccount?.type === 'wallet';
            setIsWalletLogin(isWallet);
            try {
                sessionStorage.setItem(
                    'privy_last_login_type',
                    isWallet ? 'wallet' : loginAccount?.type ?? ''
                );
            } catch(err) {
                console.error(err)
            }
        },
    });

    useEffect(() => {
        try {
            setIsWalletLogin(
                sessionStorage.getItem('privy_last_login_type') === 'wallet'
            );
        } catch (err) {
            console.error(err);
        }
    }, [authenticated]);

    // Plaid Link configuration
    const onSuccess = React.useCallback(
        (public_token: string) => {
            const exchangePublicTokenForAccessToken = async () => {
                try {
                    const response = await fetch(`/api/set_access_token`, {
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
                try {
                    localStorage.setItem('hasConnectedBank', 'true');
                } catch (_e) {
                    console.error('Error setting hasConnectedBank:', _e);
                }
                setShowWalletConnectModal(true);
                setAfterVerifyFlow(false);
            });
        },
        []
    );

    const onExit = React.useCallback(
        (err: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
            // Handle exit - reset states
            setIsTokenReceived(false);
            setCurrentLinkToken(null);
            if (plaidOverlayTimerRef.current) {
                clearTimeout(plaidOverlayTimerRef.current);
                plaidOverlayTimerRef.current = null;
            }
            setIsPlaidOverlayVisible(false);

            if (err || metadata.status !== 'connected') {
                console.log(
                    'Plaid widget closed/failed - reopening source modal'
                );
                console.log('Plaid error:', err);
                console.log('Plaid metadata:', metadata);
                console.log('Plaid launched from:', plaidLaunchedFrom);

                if (plaidLaunchedFrom === 'first-modal') {
                    console.log('Reopening first modal (Connect Bank)');
                    setShowNewUserModal(true);
                } else if (plaidLaunchedFrom === 'third-modal') {
                    console.log('Reopening third modal (Verify Identity)');
                    setShowVerifyIdentityModal(true);
                } else {
                    console.log('No source modal to reopen');
                }
                setPlaidLaunchedFrom(null);
            } else {
                console.log(
                    'Plaid completed successfully, not reopening modal'
                );
            }
        },
        [plaidLaunchedFrom]
    );

    const { open, ready: plaidLinkReady } = usePlaidLink({
        token: isTokenReceived ? currentLinkToken : null,
        onSuccess,
        onExit,
    });
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: '',
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        'credit' | 'bnpl' | null
    >(null);
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showNewAuthModal, setShowNewAuthModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showWalletInfo, setShowWalletInfo] = useState(false);
    const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
    const [showVerifyIdentityModal, setShowVerifyIdentityModal] =
        useState(false);

    useEffect(() => {
        console.log('📱 Modal states changed:', {
            showNewUserModal,
            showWalletConnectModal,
            showVerifyIdentityModal,
            showPaymentModal,
        });
    }, [
        showNewUserModal,
        showWalletConnectModal,
        showVerifyIdentityModal,
        showPaymentModal,
    ]);

    // Show onboarding modal immediately after wallet connects via Privy

    const isWalletConnected = authenticated && wallets.length > 0;

    const handleApproveOrder = React.useCallback(() => {
        // Calculate total with shipping and tax
        const shipping = 15.0;
        const tax = state.total * 0.08;
        const total = state.total + shipping + tax;

        // Save order information
        orderDispatch({
            type: 'SET_ORDER',
            payload: {
                orderNumber: Math.random()
                    .toString(36)
                    .substr(2, 9)
                    .toUpperCase(),
                totalAmount: total,
                paymentMethod: 'bnpl',
                items: state.items,
            },
        });

        // Clear cart and navigate to success page
        clearCart();
        navigate('/order-success');
    }, [state.total, state.items, orderDispatch, clearCart, navigate]);

    const [hasShownNewUserModal, setHasShownNewUserModal] = useState(false);
    const prevAuthRef = useRef<boolean>(false);
    const didMountRef = useRef<boolean>(false);
    useEffect(() => {
        // On first render, record current auth state; don't show modal
        if (!didMountRef.current) {
            didMountRef.current = true;
            prevAuthRef.current = authenticated;
            return;
        }

        const justLoggedIn = !prevAuthRef.current && authenticated;
        const isReload = (() => {
            try {
                const nav = performance.getEntriesByType('navigation')[0] as
                    | PerformanceNavigationTiming
                    | undefined;
                return nav?.type === 'reload';
            } catch (_e) {
                return false;
            }
        })();
        const hasConnectedWallet = (() => {
            try {
                return !!localStorage.getItem('hasConnectedWallet');
            } catch (_e) {
                return false;
            }
        })();
        const shownThisSession = (() => {
            try {
                return sessionStorage.getItem('shownNewUserModal') === '1';
            } catch (_e) {
                return false;
            }
        })();

        if (
            justLoggedIn &&
            !hasShownNewUserModal &&
            !shownThisSession &&
            !hasConnectedWallet
        ) {
            setShowPaymentModal(false);
            setShowNewUserModal(true);
            setHasShownNewUserModal(true);
            try {
                sessionStorage.setItem('shownNewUserModal', '1');
            } catch (_e) {
                console.error('Error exchanging public_token:', _e);
            }
        }

        prevAuthRef.current = authenticated;
    }, [authenticated, hasShownNewUserModal]);

    useEffect(() => {
        if (!authenticated) return;
        const isReload = (() => {
            try {
                const nav = performance.getEntriesByType('navigation')[0] as
                    | PerformanceNavigationTiming
                    | undefined;
                return nav?.type === 'reload';
            } catch (_e) {
                return false;
            }
        })();
        const hasConnectedWallet = (() => {
            try {
                return !!localStorage.getItem('hasConnectedWallet');
            } catch (_e) {
                return false;
            }
        })();
        const shownThisSession = (() => {
            try {
                return sessionStorage.getItem('shownNewUserModal') === '1';
            } catch (_e) {
                return false;
            }
        })();

        if (
            embeddedWallet &&
            !isReload &&
            !hasShownNewUserModal &&
            !shownThisSession &&
            !hasConnectedWallet
        ) {
            setShowPaymentModal(false);
            setShowNewUserModal(true);
            setHasShownNewUserModal(true);
            try {
                sessionStorage.setItem('shownNewUserModal', '1');
            } catch (_e) {
                console.error('Error exchanging public_token:', _e);
            }
        }
    }, [authenticated, embeddedWallet, hasShownNewUserModal]);

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

    useEffect(() => {
        // Debug tracking removed
    }, [linkToken, currentLinkToken, isTokenReceived, plaidLinkReady]);

    useEffect(() => {
        if (showWalletConnectModal && walletJustConnected) {
            const bankConnected = (() => {
                try {
                    return localStorage.getItem('hasConnectedBank') === 'true';
                } catch {
                    return false;
                }
            })();

            setTimeout(() => {
                if (bankConnected) {
                    setShowPaymentModal(true);
                } else {
                    setShowVerifyIdentityModal(true);
                }
                setWalletJustConnected(false);
            }, 100);
        }
    }, [showWalletConnectModal, walletJustConnected]);

    const [previousWalletsCount, setPreviousWalletsCount] = useState(0);
    const [isAddingWallet, setIsAddingWallet] = useState(false);

    useEffect(() => {
        console.log('👛 Wallets count changed:', {
            previousCount: previousWalletsCount,
            currentCount: wallets.length,
            showWalletConnectModal,
            authenticated,
        });

            if (
            wallets.length > previousWalletsCount &&
            previousWalletsCount > 0 &&
            isAddingWallet
        ) {
            console.log(
                '✅ New wallet actually added via Privy - opening payment modal'
            );

            try {
                localStorage.setItem('hasConnectedWallet', 'true');
                console.log(
                    '✅ Set hasConnectedWallet = true after real wallet addition'
                );
            } catch(err) {
                console.error(err);
            }

            setTimeout(() => {
                const bankConnected = (() => {
                    try {
                        return (
                            localStorage.getItem('hasConnectedBank') === 'true'
                        );
                    } catch {
                        return false;
                    }
                })();

                setShowWalletConnectModal(true);

                if (bankConnected) {
                    console.log(
                        '🏦 Bank connected - opening payment modal after wallet addition'
                    );
                    setShowPaymentModal(true);
                } else {
                    console.log(
                        '❌ Bank not connected - staying on wallet modal'
                    );
                }

                setIsAddingWallet(false);
                setWasAddingWallet(false);
                console.log(
                    '📱 Reopened wallet modal and opened appropriate next modal'
                );
            }, 1000);
        }

        setPreviousWalletsCount(wallets.length);
    }, [
        wallets.length,
        showWalletConnectModal,
        previousWalletsCount,
        authenticated,
        isAddingWallet,
    ]);

    const bankConnectedFlag = (() => {
        try {
            return localStorage.getItem('hasConnectedBank') === 'true';
        } catch {
            return false;
        }
    })();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePaymentMethodSelect = (method: 'credit' | 'bnpl') => {
        setSelectedPaymentMethod(method);
    };

    const handleConnectBank = async (
        source: 'first-modal' | 'third-modal' = 'first-modal'
    ) => {
        console.log(`🏦 Plaid launched from: ${source}`);

        setPlaidLaunchedFrom(source);

        if (source === 'first-modal') {
            console.log('Closing first modal for Plaid');
            setShowNewUserModal(false);
        } else if (source === 'third-modal') {
            console.log('Closing third modal for Plaid');
            setShowVerifyIdentityModal(false);
        }

        setIsLoadingPlaid(true);

        try {
            const response = await fetch(`/api/create_link_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_KEY,
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to create link token: ${response.status}`
                );
            }

            const data = await response.json();

            // Set the link token in context
            dispatch({
                type: 'SET_STATE',
                state: {
                    linkToken: data.link_token,
                },
            });

            // Set the current link token for usePlaidLink
            setCurrentLinkToken(data.link_token);

            // Mark that token is received - this will trigger usePlaidLink initialization
            setIsTokenReceived(true);
        } catch (error) {
            console.error('Error creating link token:', error);
        } finally {
            setIsLoadingPlaid(false);
        }
    };

    const handleVerifyIdentity = () => {
        setShowNewUserModal(false);
    };

    const handlePaymentSelection = async (selectedOption: {
        id: string;
        title: string;
        subtitle: string;
        amount: number;
        frequency: string;
        payments: number;
        apr: string;
        interest: string;
        total: number;
        isInterestFree?: boolean;
    }) => {
        // Prefer Solana flow when a Solana wallet is present
        try {
            const solWallet = wallets.find((w) => (w as any).chainType === 'solana');
            if (solWallet) {
                // Initiate a small SOL payment via Privy wallet
                const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
                const toPubkey = new PublicKey('C9qEhYUetx6LgRpHjoYRYnEU62WKTBXbsZUVPnehmsHP');
                const fromPubkey = new PublicKey((solWallet as any).address);
                const tx = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey,
                        toPubkey,
                        lamports: Math.floor(0.01 * LAMPORTS_PER_SOL),
                    })
                );
                // Let Privy's wallet sign it
                const signedTx = await (solWallet as any).signTransaction(tx);
                // Send & confirm
                const sig = await connection.sendRawTransaction(signedTx.serialize());
                await connection.confirmTransaction(sig, 'confirmed');
                console.log('✅ Sent 0.01 SOL:', sig);
                setShowPaymentModal(false);
                handleApproveOrder();
                return;
            }
        } catch (e) {
            console.error('Solana payment failed, falling back to EVM flow:', e);
        }

        // Fallback to existing EVM payment flow
        await handleTransactionConfirm();
    };

    const handleTransactionConfirm = async () => {
        setIsProcessingPayment(true);

        try {
            console.log('Transaction confirmed, executing...');

            // Calculate total with shipping and tax
            const shipping = 15.0;
            const tax = state.total * 0.08;
            const total = state.total + shipping + tax;

            // Check authentication
            if (!ready || !authenticated) {
                throw new Error(
                    'User is not authenticated or Privy is not ready. Please log in.'
                );
            }

            // Ensure a Solana wallet is present
            if (!wallets || wallets.length === 0) {
                throw new Error('No Solana wallet connected.');
            }

            const selectedWallet = wallets[0];
            const recipient = 'DJ9MAJHQ3YjPfUFN7b3LguSFmFP8pUkxKYDkVBNUFnK4';
            const solAmount = 0.01;

            const transferIx = SystemProgram.transfer({
                fromPubkey: new PublicKey(selectedWallet.address),
                toPubkey: new PublicKey(recipient),
                lamports: Math.floor(solAmount * LAMPORTS_PER_SOL),
            });
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const { blockhash } = await connection.getLatestBlockhash();

            const v0Message = new TransactionMessage({
                payerKey: new PublicKey(selectedWallet.address),
                recentBlockhash: blockhash,
                instructions: [transferIx],
            }).compileToV0Message();

            const vtx = new VersionedTransaction(v0Message);
            const transaction = vtx.serialize();

            const result = await signAndSendTransaction({
                transaction,
                wallet: selectedWallet,
            });
            console.log('Transaction sent with signature:', result.signature);

            // Save order information after successful payment
            orderDispatch({
                type: 'SET_ORDER',
                payload: {
                    orderNumber: Math.random()
                        .toString(36)
                        .substr(2, 9)
                        .toUpperCase(),
                    totalAmount: total,
                    paymentMethod: 'bnpl',
                    items: state.items,
                },
            });

            setIsProcessingPayment(false);

            // Clear cart and navigate to success page
            clearCart();
            navigate('/order-success');
        } catch (error) {
            console.error('Transaction failed:', error);
            setIsProcessingPayment(false);

            // Show user-friendly error message
            const errorMessage = error.message || 'Unknown error occurred';
            let userMessage = 'Transaction failed. Please try again.';
            let showWalletModal = false;

            console.log('Payment error:', errorMessage);

            if (
                errorMessage.includes('No embedded wallet') ||
                errorMessage.includes('No connected wallet')
            ) {
                userMessage =
                    'Embedded wallet not connected. Please connect a wallet through Privy.';
                showWalletModal = true;
            } else if (
                errorMessage.includes('insufficient funds') ||
                errorMessage.includes('insufficient balance') ||
                errorMessage.includes('0 USDC')
            ) {
                userMessage =
                    'Insufficient funds. Please add ETH and USDC to your wallet.';
                showWalletModal = true;
                console.log('Setting showWalletModal to true');
            } else if (errorMessage.includes('user rejected')) {
                userMessage = 'Transaction was cancelled. Please try again.';
            } else if (errorMessage.includes('Please switch to Solana devnet')) {
                userMessage = 'Please switch to Solana devnet to continue.';
            }

            alert(userMessage);

            if (showWalletModal) {
                setShowWalletConnectModal(true);
            } else {
                setShowPaymentModal(true); // Return user to payment modal
            }
        }
    };

    // Helper function to create USDC transfer data
    const createUSDCTransferData = (toAddress: string, amount: string) => {
        // USDC has 6 decimals, so we need to multiply by 1,000,000
        const amountInWei = (parseFloat(amount) * 1000000).toString();

        // Method signature for transfer(address,uint256)
        const methodSignature = '0xa9059cbb';

        // Pad the address to 32 bytes
        const paddedAddress = toAddress.slice(2).padStart(64, '0');

        // Pad the amount to 32 bytes
        const paddedAmount = BigInt(amountInWei).toString(16).padStart(64, '0');

        return methodSignature + paddedAddress + paddedAmount;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if Privy is ready
        if (!ready) {
            return;
        }

        // BNPL readiness checks
        const bankConnected = (() => {
            try {
                return localStorage.getItem('hasConnectedBank') === 'true';
            } catch {
                return false;
            }
        })();

        if (selectedPaymentMethod === 'bnpl') {
            const hasConnectedWallet =
                localStorage.getItem('hasConnectedWallet') === 'true';

            console.log('💳 Checkout with Yumi clicked - BNPL flow:', {
                bankConnected,
                hasConnectedWallet,
                authenticated,
                ready,
                hasCompletedVerificationFlow,
            });

            // Open /auth in a new tab for BNPL flow
            if (!hasCompletedVerificationFlow) {
                window.open('/auth', '_blank');
                return;
            }
            setShowPaymentModal(true);
            return;
        }

        // If user is authenticated and not BNPL flow or fallback
        const hasConnectedWallet = localStorage.getItem('hasConnectedWallet');

        if (hasConnectedWallet) {
            // For BNPL, always show payment options modal
            if (
                // selectedPaymentMethod === 'bnpl' ||   // dont know for what is it because in if() {} above we already do something for 'bnpl'
                selectedPaymentMethod === null
            ) {
                setShowPaymentModal(true);
            } else {
                // For credit card, go straight to success
                handleApproveOrder();
            }
        } else {
            // If wallet is not connected, prompt to set up
            setShowNewUserModal(true);
        }
    };

    const shipping = 15.0;
    const tax = state.total * 0.08;
    const total = state.total + shipping + tax;

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        Your cart is empty
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Add some items to your cart before checking out
                    </p>
                    <Link to="/products">
                        <Button variant="checkout">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            {isPlaidOverlayVisible &&
                createPortal(
                    <div className="fixed inset-0 z-[9998] bg-white/10 backdrop-blur" />,
                    document.body
                )}
            {isZkMeOverlayVisible &&
                createPortal(
                    <div className="fixed inset-0 z-[99] bg-white/10 backdrop-blur pointer-events-none" />,
                    document.body
                )}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/products"
                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-3xl font-bold">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Checkout Form */}
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                            1
                                        </div>
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Insufficient Funds Notice */}
                            {authenticated && showWalletInfo && (
                                <Card className="bg-orange-50 border-orange-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Shield className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-orange-900">
                                                        Insufficient Funds
                                                    </h3>
                                                    <p className="text-xs text-orange-700">
                                                        You need to add funds to
                                                        complete this payment.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={async () => {
                                                        setShowWalletInfo(
                                                            false
                                                        );
                                                        setShowPaymentModal(
                                                            true
                                                        );
                                                        // Try the payment again after user adds funds
                                                        setTimeout(async () => {
                                                            try {
                                                                // Just retry the payment
                                                                const selectedOption =
                                                                    {
                                                                        id: 'option1',
                                                                        title: 'Pay in full',
                                                                        subtitle:
                                                                            'Pay the full amount today',
                                                                        amount: total,
                                                                        frequency:
                                                                            'One-time',
                                                                        payments: 1,
                                                                        apr: '0%',
                                                                        interest:
                                                                            'Free',
                                                                        total: total,
                                                                        isInterestFree:
                                                                            true,
                                                                    };
                                                                await handlePaymentSelection(
                                                                    selectedOption
                                                                );
                                                            } catch (error) {
                                                                console.log(
                                                                    'Payment failed'
                                                                );
                                                            }
                                                        }, 2000);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-orange-700 border-orange-300 hover:bg-orange-100"
                                                >
                                                    Add Funds & Retry
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setShowWalletInfo(
                                                            false
                                                        );
                                                        setShowPaymentModal(
                                                            false
                                                        );
                                                        alert(
                                                            'To add funds:\n1. Look for the Privy wallet icon in your browser\n2. Click on it to open your wallet\n3. Use the "Add funds" option in your wallet\n4. Return here and click "Add Funds & Retry"'
                                                        );
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-orange-700 border-orange-300 hover:bg-orange-100"
                                                >
                                                    How to Add Funds
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                            2
                                        </div>
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">
                                                First Name
                                            </Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="zipCode">
                                                ZIP Code
                                            </Label>
                                            <Input
                                                id="zipCode"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">
                                                Country
                                            </Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                placeholder="United States"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Options */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                            3
                                        </div>
                                        Payment Options
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Credit Card Option */}
                                    <div
                                        className={`p-4 md:p-6 border-2 rounded-lg transition-all cursor-pointer group ${
                                            selectedPaymentMethod === 'credit'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                                        }`}
                                        onClick={() =>
                                            handlePaymentMethodSelect('credit')
                                        }
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div className="flex items-start gap-4 min-w-0">
                                                <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                                                    <CreditCard className="w-6 h-6 text-blue-600 group-hover:text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg mb-1">
                                                        Pay with Card
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm mb-2">
                                                        Pay instantly with your
                                                        card
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                                        <span>Visa</span>
                                                        <span>•</span>
                                                        <span>MasterCard</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-right shrink-0 whitespace-nowrap sm:self-center mx-auto sm:mx-0">
                                                <div className="text-2xl font-bold text-primary whitespace-nowrap">
                                                    ${total.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-muted-foreground whitespace-nowrap text-center sm:text-right">
                                                    One-time payment
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BNPL Option */}
                                    <div
                                        className={`p-4 md:p-6 border-2 rounded-lg transition-all cursor-pointer group ${
                                            selectedPaymentMethod === 'bnpl'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                                        }`}
                                        onClick={() =>
                                            handlePaymentMethodSelect('bnpl')
                                        }
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div className="flex items-start gap-4 min-w-0">
                                                <div className="p-2 md:p-3 bg-green-100 rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                                                    <Calendar className="w-6 h-6 text-green-600 group-hover:text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg mb-1">
                                                        Buy Now, Pay Later
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm mb-2">
                                                        Pay in three
                                                        installments of $
                                                        {(total / 3).toFixed(2)}
                                                    </p>
                                                    <div className="text-xs text-muted-foreground">
                                                        Pay over time
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center sm:text-right shrink-0 whitespace-nowrap sm:self-center mx-auto sm:mx-0">
                                                <div className="text-2xl font-bold text-primary whitespace-nowrap">
                                                    ${total.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-muted-foreground whitespace-nowrap text-center sm:text-right">
                                                    Split into 4 payments
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                variant="checkout"
                                size="lg"
                                className="w-full gap-2"
                                disabled={!selectedPaymentMethod || !ready}
                            >
                                <CreditCard className="w-5 h-5" />
                                {!ready
                                    ? 'Loading...'
                                    : !authenticated
                                    ? 'Login to Complete Order'
                                    : selectedPaymentMethod === 'bnpl'
                                    ? 'Checkout with Yumi'
                                    : 'Complete Order'}
                                {/* Debug info */}
                                {process.env.NODE_ENV === 'development' && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        ({ready ? 'ready' : 'not ready'},{' '}
                                        {authenticated ? 'auth' : 'not auth'})
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-8 lg:self-start">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Cart Items */}
                                <div className="space-y-3">
                                    {state.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center space-x-3"
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                $
                                                {(
                                                    item.price * item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Pricing Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${state.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span className="text-primary">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* New Unified Auth Flow Modal */}
            <Dialog open={showNewAuthModal} onOpenChange={(open) => setShowNewAuthModal(open)}>
                <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-transparent border-0 p-0">
                    <SignInScreen onCryptoWalletRequested={() => {}} />
                </DialogContent>
            </Dialog>

            {/* Connect Wallet Modal (legacy) */}
            <ConnectWalletModal
                isOpen={showWalletConnectModal}
                onConnectWallet={() => {
                    setShowWalletConnectModal(true);
                }}
                onBack={() => {
                    const bankConnected = (() => {
                        try {
                            return (
                                localStorage.getItem('hasConnectedBank') ===
                                'true'
                            );
                        } catch {
                            return false;
                        }
                    })();
                    setShowWalletConnectModal(false);
                    if (bankConnected) {
                        setShowNewUserModal(true);
                    } else {
                        setShowNewUserModal(true);
                    }
                }}
                onClose={() => setShowWalletConnectModal(false)}
                onCloseByX={() => setShowWalletConnectModal(false)}
                isConnected={isWalletLogin}
                onSelectWallet={() => {
                    const bankConnected = (() => {
                        try {
                            return (
                                localStorage.getItem('hasConnectedBank') ===
                                'true'
                            );
                        } catch {
                            return false;
                        }
                    })();
                    if (bankConnected) {
                        setShowWalletConnectModal(false);
                        setShowPaymentModal(true);
                    } else {
                        console.log(
                            '❌ Bank not connected - opening verify identity modal'
                        );
                        setShowWalletConnectModal(false);
                        setShowVerifyIdentityModal(true);
                    }
                }}
                onContinue={() => {
                    console.log('🔄 Continue button clicked in wallet modal');

                    const bankConnected = (() => {
                        try {
                            return (
                                localStorage.getItem('hasConnectedBank') ===
                                'true'
                            );
                        } catch {
                            return false;
                        }
                    })();

                    try {
                        localStorage.setItem('hasConnectedWallet', 'true');
                        console.log('✅ Set hasConnectedWallet = true');
                    } catch(err) {
                        console.error(err)
                    }

                    if (bankConnected) {
                        console.log(
                            '🏦 Bank connected - opening payment modal (approve)'
                        );
                        setShowWalletConnectModal(false);
                        setShowPaymentModal(true);
                    } else {
                        console.log(
                            '❌ Bank not connected - opening verify identity modal (choose how to pay)'
                        );
                        setShowWalletConnectModal(false);
                        setShowVerifyIdentityModal(true);
                    }
                }}
                onWalletAdded={() => {
                    console.log(
                        '🔗 "Add another wallet" clicked - Privy modal will open'
                    );
                    setIsAddingWallet(true);
                    setWasAddingWallet(true);
                    console.log(
                        '✅ Set isAddingWallet = true - waiting for wallet addition'
                    );
                }}
                canSkip={bankConnectedFlag}
            />

            {/* Verify Identity Modal */}
            <VerifyIdentityModal
                isOpen={showVerifyIdentityModal}
                onVerifyWithZkMe={async () => {
                    try {
                        setPrivyWalletAddress(user?.wallet?.address || null);

                        const appId = import.meta.env.VITE_ZKME_APP_ID;
                        const options = {
                            programNo: import.meta.env.VITE_ZKME_PROGRAM_NO,
                        };

                        const { isGrant } = await verifyKycWithZkMeServices(
                            appId,
                            user?.wallet?.address,
                            options
                        );

                        if (isGrant) {
                            // User already verified, skip zkMe and go directly to payment
                            setShowPaymentModal(true);
                        } else {
                            // User not verified, launch zkMe verification with Privy wallet
                            zkMeService.onClosed(() => {
                                console.log(
                                    'zkMe widget closed - opening payment modal'
                                );
                                setShowVerifyIdentityModal(false);
                                setShowPaymentModal(true);
                                setHasCompletedVerificationFlow(true);
                            });
                            zkMeService.onKycFinished(
                                (_results: KycResults) => {
                                    setShowPaymentModal(true);
                                    setHasCompletedVerificationFlow(true);
                                }
                            );
                            zkMeService.launch();
                        }
                    } catch (e) {
                        console.error('zkMe verification error:', e);
                        setShowPaymentModal(true);
                    }
                    setShowVerifyIdentityModal(false);
                }}
                onVerifyWithBank={() => {
                    setAfterVerifyFlow(true);
                    handleConnectBank('third-modal');
                }}
                onBack={() => {
                    setShowVerifyIdentityModal(false);
                    setShowWalletConnectModal(true);
                }}
                onClose={() => setShowVerifyIdentityModal(false)}
            />

            {/* Yumi Payment Modal */}
            <YumiPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPay={handlePaymentSelection}
                totalAmount={total}
                isProcessing={isProcessingPayment}
            />
        </div>
    );
};
