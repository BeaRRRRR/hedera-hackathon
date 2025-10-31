import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface OrderState {
    orderNumber: string;
    totalAmount: number;
    paymentMethod: 'credit' | 'bnpl' | null;
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
    }>;
}

interface OrderContextType {
    state: OrderState;
    dispatch: React.Dispatch<OrderAction>;
}

type OrderAction =
    | { type: 'SET_ORDER'; payload: Partial<OrderState> }
    | { type: 'CLEAR_ORDER' };

const initialState: OrderState = {
    orderNumber: '',
    totalAmount: 0,
    paymentMethod: null,
    items: [],
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
    switch (action.type) {
        case 'SET_ORDER':
            return {
                ...state,
                ...action.payload,
            };
        case 'CLEAR_ORDER':
            return initialState;
        default:
            return state;
    }
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(orderReducer, initialState);

    return (
        <OrderContext.Provider value={{ state, dispatch }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
