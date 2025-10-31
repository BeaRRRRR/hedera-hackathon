import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { CreditCard, Calendar, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import Context from '@/Context';
import PlaidLink from '@/components/Link';

export const PaymentMethod = () => {
    const { state } = useCart();
    const navigate = useNavigate();
    const { dispatch, linkToken } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);

    const handlePaymentMethodSelect = async (method: 'credit' | 'bnpl') => {
        if (method === 'bnpl') {
            setIsLoading(true);
            try {
                const response = await fetch('/api/create_link_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': import.meta.env.VITE_API_KEY,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to create link token');
                }

                const data = await response.json();
                console.log('Link token received:', data);

                // Set the link token in context
                dispatch({
                    type: 'SET_STATE',
                    state: {
                        linkToken: data.link_token,
                    },
                });
            } catch (error) {
                console.error('Error creating link token:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            navigate('/checkout');
        }
    };

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Add some items to your cart before choosing payment
                            method.
                        </p>
                        <Link to="/products">
                            <Button className="w-full" size="lg">
                                Continue Shopping
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const shipping = 15.0;
    const tax = state.total * 0.08;
    const total = state.total + shipping + tax;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-4 px-4 md:py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <Link
                        to="/products"
                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 hidden md:block">
                        Choose how to pay
                    </h1>
                    <p className="text-muted-foreground hidden md:block mb-4">
                        Select your preferred payment method
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    {/* Payment Options */}
                    <div className="space-y-4 md:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Options</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Credit Card Option */}
                                <div
                                    className="p-4 md:p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
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
                                                    Pay instantly with your card
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
                                <div className="p-4 md:p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group">
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
                                                    Pay in three installments of
                                                    ${(total / 3).toFixed(2)}
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

                                    {/* BNPL Action */}
                                    <div className="mt-4">
                                        {linkToken && linkToken !== '' ? (
                                            <PlaidLink />
                                        ) : (
                                            <Button
                                                onClick={() =>
                                                    handlePaymentMethodSelect(
                                                        'bnpl'
                                                    )
                                                }
                                                className="w-full"
                                                variant="default"
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? 'Connecting...'
                                                    : 'Connect Bank Account'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-8 lg:self-start mt-4 md:mt-0">
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

                                <div className="border-t pt-4 space-y-2">
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

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
