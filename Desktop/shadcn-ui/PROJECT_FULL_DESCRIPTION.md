# SportFlare FitnessVerse - Project Description

## Project Overview
SportFlare FitnessVerse is a comprehensive fitness platform that connects fitness enthusiasts with gyms, coaches, and fitness programs. The platform serves as a one-stop solution for discovering, booking, and managing fitness activities while providing tools for fitness professionals to manage their offerings and engage with clients.

## Core Features

### 1. User-Facing Features
- **Class Discovery & Booking**: Browse and book fitness classes with real-time availability
- **Program Enrollment**: Join structured fitness programs with scheduled sessions
- **Gym Locator**: Find nearby fitness centers with detailed information and reviews
- **Coach Profiles**: View coach credentials, specialties, and book personal training sessions
- **Unified Calendar**: Manage all bookings and sessions in one place
- **Progress Tracking**: Monitor fitness journey with activity history and achievements

### 2. Coach & Gym Owner Tools
- **Schedule Management**: Set availability and manage bookings
- **Client Management**: Track client progress and communication
- **Class & Program Creation**: Design and publish fitness offerings
- **Analytics Dashboard**: Monitor business performance and client engagement
- **Payment Processing**: Handle transactions and revenue tracking

### 3. E-commerce & Payments
- **Secure Checkout**: Integrated payment processing
- **Membership Plans**: Subscription-based access to premium features
- **Voucher System**: Gift cards and promotional offers
- **Order Management**: Track purchases and manage returns

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theming
- **UI Components**: shadcn/ui (built on Radix UI)
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend (Referenced in Frontend)
- **RESTful API**: JSON-based endpoints
- **Authentication**: JWT with role-based access control
- **Real-time Features**: WebSocket integration for chat and notifications
- **File Storage**: Cloud storage for media and documents

## Project Structure

```
src/
├── app/                 # Main application routes
│   ├── (gym-owner)/    # Gym owner specific routes
│   ├── classes/        # Class-related pages
│   └── unauthorized/   # Unauthorized access views
├── components/         # Reusable UI components
│   ├── booking/        # Booking-related components
│   ├── cart/           # Shopping cart components
│   ├── classes/        # Class-related components
│   ├── coach/          # Coach profile components
│   └── ui/             # Base UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # API service layer
├── theme/              # Theming configuration
└── types/              # TypeScript type definitions
```

## Key Dependencies

### Core
- React 18
- TypeScript
- Vite
- React Router v6
- React Query
- React Hook Form + Zod
- Tailwind CSS
- shadcn/ui + Radix UI
- Lucide Icons

### Utilities
- date-fns: Date manipulation
- axios: HTTP client
- uuid: ID generation
- recharts: Data visualization
- sonner: Toast notifications

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8.x

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Update environment variables with your configuration

### Available Scripts
- `pnpm dev`: Start development server
- `pnpm build`: Create production build
- `pnpm preview`: Preview production build locally
- `pnpm lint`: Run ESLint
- `pnpm test`: Run tests

## Deployment

The application is configured for deployment on Vercel, Netlify, or any static hosting service that supports single-page applications.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, modification, public display, or public performance of this project is strictly prohibited.

## Contact

For more information, please contact the project maintainers at [your-email@example.com]

---
*Last Updated: August 16, 2025*
