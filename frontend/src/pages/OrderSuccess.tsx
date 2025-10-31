import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';
import { BNPLPaymentPlan } from '@/components/BNPLPaymentPlan';

export const OrderSuccess = () => {
    const { state: orderState } = useOrder();
    const orderNumber =
        orderState.orderNumber ||
        Math.random().toString(36).substr(2, 9).toUpperCase();

    return (
        <div className="min-h-screen py-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
                <div className="text-center space-y-2">
                    {/* Success Icon */}
                    <div className="w-10 h-10 mx-auto bg-accent rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    {/* Success Message */}
                    <div>
                        <h1 className="text-3xl font-bold mb-4">
                            Order Confirmed!
                        </h1>
                    </div>

                    {/* Order Details */}
                    <Card>
                        <CardContent className="p-2">
                            <div className="text-center space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Order Number
                                    </p>
                                    <p className="text-xl font-bold text-primary">
                                        #{orderNumber}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BNPL Payment Plan */}
                    {orderState.paymentMethod === 'bnpl' &&
                        orderState.totalAmount > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-center">
                                    Your Payment Plan
                                </h3>
                                <BNPLPaymentPlan
                                    totalAmount={orderState.totalAmount}
                                    paymentCount={4}
                                    paymentInterval="2 weeks"
                                />
                            </div>
                        )}

                    {/* What's Next */}
                    {/* <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                What's Next?
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">
                                            Processing
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            We're preparing your order for
                                            shipment
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Truck className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">Shipping</p>
                                        <p className="text-sm text-muted-foreground">
                                            Your order will be shipped within
                                            1-2 business days
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">Tracking</p>
                                        <p className="text-sm text-muted-foreground">
                                            You'll receive tracking information
                                            via email
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/products">
                            <Button variant="checkout" size="lg">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
