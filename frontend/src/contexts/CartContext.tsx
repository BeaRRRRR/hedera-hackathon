/* eslint-disable react-refresh/only-export-components */
import React, {
    createContext,
    useContext,
    useReducer,
    ReactNode,
    useEffect,
} from 'react';
import { toast } from '@/hooks/use-toast';

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: Product }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' };

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
    addToCart: (product: Product) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(
                (item) => item.id === action.payload.id
            );

            if (existingItem) {
                const updatedItems = state.items.map((item) =>
                    item.id === action.payload.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                return {
                    ...state,
                    items: updatedItems,
                    total: calculateTotal(updatedItems),
                    itemCount: calculateItemCount(updatedItems),
                };
            }

            const newItems = [
                ...state.items,
                { ...action.payload, quantity: 1 },
            ];
            return {
                ...state,
                items: newItems,
                total: calculateTotal(newItems),
                itemCount: calculateItemCount(newItems),
            };
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(
                (item) => item.id !== action.payload
            );
            return {
                ...state,
                items: newItems,
                total: calculateTotal(newItems),
                itemCount: calculateItemCount(newItems),
            };
        }

        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                const newItems = state.items.filter(
                    (item) => item.id !== action.payload.id
                );
                return {
                    ...state,
                    items: newItems,
                    total: calculateTotal(newItems),
                    itemCount: calculateItemCount(newItems),
                };
            }

            const updatedItems = state.items.map((item) =>
                item.id === action.payload.id
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            );
            return {
                ...state,
                items: updatedItems,
                total: calculateTotal(updatedItems),
                itemCount: calculateItemCount(updatedItems),
            };
        }

        case 'CLEAR_CART':
            return { items: [], total: 0, itemCount: 0 };

        default:
            return state;
    }
};

const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(cartReducer, undefined, () => {
        try {
            const stored = localStorage.getItem('cart_state_v1');
            if (stored) {
                const parsed = JSON.parse(stored) as { items: CartItem[] };
                const items = Array.isArray(parsed.items) ? parsed.items : [];
                return {
                    items,
                    total: calculateTotal(items),
                    itemCount: calculateItemCount(items),
                } as CartState;
            }
        } catch (_err) {
            // ignore and fall back to defaults
        }
        return { items: [], total: 0, itemCount: 0 } as CartState;
    });

    // Persist to localStorage on every state change
    useEffect(() => {
        try {
            localStorage.setItem(
                'cart_state_v1',
                JSON.stringify({ items: state.items })
            );
        } catch (_err) {
            // ignore storage errors (private mode etc.)
        }
    }, [state.items]);

    const addToCart = (product: Product) => {
        dispatch({ type: 'ADD_ITEM', payload: product });
        toast({
            title: 'Added to cart',
            description: `${product.name} has been added to your cart.`,
        });
    };

    const removeFromCart = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
        toast({
            title: 'Removed from cart',
            description: 'Item has been removed from your cart.',
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
        toast({
            title: 'Cart cleared',
            description: 'All items have been removed from your cart.',
        });
    };

    return (
        <CartContext.Provider
            value={{
                state,
                dispatch,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
