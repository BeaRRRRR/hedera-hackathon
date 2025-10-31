import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const CartSheet = () => {
    const { state, removeFromCart, updateQuantity } = useCart();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {state.itemCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {state.itemCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-lg cart-shadow">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold">
                        Shopping Cart
                    </SheetTitle>
                    <SheetDescription>
                        {state.itemCount}{' '}
                        {state.itemCount === 1 ? 'item' : 'items'} in your cart
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {state.items.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Your cart is empty
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Add some items to get started
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {state.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center space-x-4 bg-muted/30 p-3 rounded-lg"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-md"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-primary font-semibold">
                                                ${item.price}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity - 1
                                                    )
                                                }
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>

                                            <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity + 1
                                                    )
                                                }
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    removeFromCart(item.id)
                                                }
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Total:</span>
                                    <span className="text-primary">
                                        ${state.total.toFixed(2)}
                                    </span>
                                </div>

                                <Button
                                    variant="checkout"
                                    className="w-full"
                                    size="lg"
                                    onClick={() => {
                                        setOpen(false);
                                        navigate('/checkout');
                                    }}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
