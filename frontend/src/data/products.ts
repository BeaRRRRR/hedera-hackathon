// Avoid importing from a component file to keep fast-refresh clean
export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
}
import {
    productHeadphones,
    productHandbag,
    productWatch,
    slingBagCheckeredGray,
    sportWatchGreenBand,
    headphonesOverEarBlack,
} from '@/assets';

export const products: Product[] = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 299.99,
        image: productHeadphones,
        description:
            'High-quality wireless headphones with noise cancellation and premium sound quality.',
        category: 'Electronics',
    },
    {
        id: '2',
        name: 'Luxury Leather Handbag',
        price: 459.99,
        image: slingBagCheckeredGray,
        description:
            'Elegant leather handbag crafted from the finest materials with timeless design.',
        category: 'Fashion',
    },
    {
        id: '3',
        name: 'Smart Fitness Watch',
        price: 199.99,
        image: productWatch,
        description:
            'Advanced fitness tracking with heart rate monitoring and smartphone connectivity.',
        category: 'Electronics',
    },
    {
        id: '4',
        name: 'Wireless Earbuds Pro',
        price: 179.99,
        image: headphonesOverEarBlack,
        description:
            'Compact wireless earbuds with superior sound quality and long battery life.',
        category: 'Electronics',
    },
    {
        id: '5',
        name: 'Designer Crossbody Bag',
        price: 329.99,
        image: productHandbag,
        description:
            'Stylish crossbody bag perfect for everyday use with premium finishing.',
        category: 'Fashion',
    },
    {
        id: '6',
        name: 'Sport Smartwatch',
        price: 249.99,
        image: sportWatchGreenBand,
        description:
            'Rugged smartwatch designed for active lifestyles with GPS and water resistance.',
        category: 'Electronics',
    },
];
