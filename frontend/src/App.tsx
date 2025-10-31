import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { QuickstartProvider } from '@/Context';
import { PrivyProvider } from '@/contexts/PrivyProvider';

import { Header } from '@/components/Header';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';

import { Checkout } from './pages/Checkout';

import { OrderSuccess } from './pages/OrderSuccess';
import NotFound from './pages/NotFound';
import SignInScreen from '@/newauth/SignInScreen';
import { useState } from 'react';
import ConnectWalletModal from '@/components/ConnectWalletModal';

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <PrivyProvider>
                <CartProvider>
                    <OrderProvider>
                        <QuickstartProvider>
                            <Toaster />
                            <Sonner />
                            <BrowserRouter>
                                <Header />
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/product/:id" element={<ProductDetail />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/order-success" element={<OrderSuccess />} />
                                    <Route
                                      path="/auth"
                                      element={<AuthRouteWrapper />}
                                    />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </BrowserRouter>
                        </QuickstartProvider>
                    </OrderProvider>
                </CartProvider>
            </PrivyProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;

function AuthRouteWrapper() {
    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const onCryptoWalletRequested = async () => {
        setWalletModalOpen(true);
    };
    return (
        <>
            <SignInScreen onCryptoWalletRequested={onCryptoWalletRequested} />
            <ConnectWalletModal
                isOpen={walletModalOpen}
                onConnectWallet={() => setWalletModalOpen(false)}
                onBack={() => setWalletModalOpen(false)}
                onClose={() => setWalletModalOpen(false)}
                onCloseByX={() => setWalletModalOpen(false)}
            />
        </>
    );
}
