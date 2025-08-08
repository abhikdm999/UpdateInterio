# E-commerce Application

## Overview
This is an e-commerce application migrated from Bolt to Replit. The application has been successfully migrated from Supabase to PostgreSQL with Drizzle ORM for improved security and compatibility with Replit's environment.

## Project Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS, and shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: Redux Toolkit and React Query for server state
- **Authentication**: Server-side authentication with bcrypt
- **Payment**: Multi-payment gateway integration (Stripe, UPI, Razorpay, COD)

## Recent Changes
### Migration from Bolt to Replit (August 8, 2025) - COMPLETED
- [x] Installed required packages and dependencies
- [x] Created comprehensive Drizzle schema with all necessary tables
- [x] Implemented complete API layer replacing Supabase functionality
- [x] Set up PostgreSQL database with sample products and categories  
- [x] Removed all Supabase dependencies from components
- [x] Fixed authentication modal and import issues
- [x] Updated payment components to use new API service
- [x] Configured secure client/server separation with proper validation
- [x] Application successfully running with authentic data from database

### Stripe Payment Processing Integration (August 8, 2025) - COMPLETED
- [x] Integrated Stripe payment processing with dummy keys for development
- [x] Added Stripe API routes with payment intent creation and webhook handling
- [x] Created comprehensive StripeCheckout component with test mode support
- [x] Updated payment method selection to include Credit/Debit Card option
- [x] Enhanced StreamlinedCheckout to handle Stripe payments alongside UPI and COD
- [x] Added proper error handling and payment flow management
- [x] Implemented mock payment processing for development environment

## User Preferences
- Prefers comprehensive solutions with detailed implementation
- Values security and best practices
- Wants client/server separation for better architecture

## Technical Notes
- Database URL and credentials are available as environment variables
- Authentication uses bcrypt for password hashing
- All API routes are prefixed with `/api`
- Using UUID primary keys for all database tables
- TypeScript with strict type checking enabled