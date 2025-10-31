# Yumi Checkout Demo

A modern e-commerce checkout application demonstrating Buy Now, Pay Later (BNPL) functionality with crypto wallet integration, bank account verification, and identity verification using zkMe.

## 🚀 Features

### Core E-commerce Functionality
- **Product Catalog**: Browse premium products including electronics and fashion items
- **Shopping Cart**: Add/remove items with real-time price calculations
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components
- **Order Management**: Complete order tracking and success confirmation

### Payment Options
- **Credit Card Payment**: Traditional instant payment with card
- **Buy Now, Pay Later (BNPL)**: Split payments into installments
- **Crypto Wallet Integration**: Support for ETH and USDC payments on Base network

### Advanced Verification Flow
- **Bank Account Connection**: Secure bank linking via Plaid integration
- **Wallet Connection**: Support for multiple wallet types via Privy
- **Identity Verification**: zkMe-powered KYC verification with privacy-preserving proofs
- **Multi-step Onboarding**: Guided user experience for payment setup

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for navigation
- **React Hook Form** for form management
- **TanStack Query** for data fetching

### Blockchain & Payments
- **Privy** for wallet authentication and management
- **Solana Network** (Ethereum L2) for crypto transactions
- **Plaid** for bank account verification
- **zkMe** for privacy-preserving identity verification

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Node.js polyfills** for blockchain compatibility

## 📦 Installation

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn package manager

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🔧 Configuration

### Environment Variables
1. Copy the example file and fill in your values:

```bash
cp .env.example .env
```

2. Variables used by the app (see `.env.example`):

```env
# API
VITE_API_HOST=
VITE_API_KEY=
VITE_API_BASE_URL=

# Privy
VITE_PRIVY_APP_ID=

# zkMe
VITE_ZKME_APP_ID=
VITE_ZKME_PROGRAM_NO=
VITE_ZKME_API_KEY=

# Optional zkMe settings
VITE_ZKME_CHAIN_ID=1
VITE_ZKME_DAPP_NAME=zkMe Frontend
```

### API Proxy
The development server proxies `/api` requests to your backend API. Configure the target URL in `vite.config.ts` or via the `VITE_API_HOST` environment variable.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── Header.tsx      # Navigation header
│   ├── ProductCard.tsx # Product display component
│   └── ...             # Other components
├── contexts/           # React context providers
│   ├── CartContext.tsx # Shopping cart state
│   ├── OrderContext.tsx # Order management
│   └── PrivyProvider.tsx # Wallet authentication
├── pages/              # Route components
│   ├── Home.tsx        # Landing page
│   ├── Products.tsx    # Product catalog
│   ├── Checkout.tsx    # Checkout flow
│   └── ...
├── services/           # External service integrations
│   └── zkMeService.ts  # zkMe verification service
├── data/               # Static data
│   └── products.ts     # Product catalog data
└── assets/             # Images and static assets
```

## 🔄 User Flow

### Standard Checkout
1. **Browse Products**: View product catalog on home page
2. **Add to Cart**: Select items and quantities
3. **Checkout**: Choose payment method (Card or BNPL)
4. **Complete Order**: Process payment and confirm order

### BNPL Flow
1. **Select BNPL**: Choose "Buy Now, Pay Later" option
2. **Bank Connection**: Link bank account via Plaid (optional)
3. **Wallet Setup**: Connect crypto wallet via Privy
4. **Identity Verification**: Complete KYC via zkMe (if needed)
5. **Payment Approval**: Approve crypto transaction
6. **Order Confirmation**: Receive order confirmation

## 🔐 Security Features

- **Encrypted Communications**: All API calls use HTTPS
- **Wallet Security**: Privy-managed wallet authentication
- **Privacy-Preserving Verification**: zkMe zero-knowledge proofs
- **Secure Bank Integration**: Plaid's bank-level security
- **Input Validation**: Form validation and sanitization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
The project includes `vercel.json` configuration for easy deployment to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup
Ensure all required environment variables are configured in your deployment environment.

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Maintain TypeScript strict mode
- Follow React best practices

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Links

- [Privy Documentation](https://docs.privy.io/)
- [Plaid Documentation](https://plaid.com/docs/)
- [zkMe Documentation](https://docs.zkme.io/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.