import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart, Product } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();

    return (
        <Card className="product-card group cursor-pointer">
            <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </Link>

            <CardContent className="p-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-2">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-bold text-primary">
                            ${product.price}
                        </span>

                        <Button
                            variant="cart"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                addToCart(product);
                            }}
                            className="gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
