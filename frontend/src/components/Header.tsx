import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CartSheet } from './CartSheet';
import { Button } from '@/components/ui/button';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

export const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                S
                            </span>
                        </div>
                        <span className="text-xl font-bold text-primary">
                            Shop
                        </span>
                    </Link>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 pr-4"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/"
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            Products
                        </Link>
                        {/* Categories removed */}
                    </nav>

                    {/* Cart and Mobile Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Search */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        <CartSheet />

                        {/* Mobile Menu */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    aria-label="Open menu"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col space-y-4">
                                    <Link
                                        to="/"
                                        className="text-sm font-medium"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="text-sm font-medium"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Products
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
};
