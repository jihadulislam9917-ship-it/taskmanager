# Production Deployment Guide

## Overview
This application is a full-stack Task Manager with a Go (Gin) backend, Next.js frontend, and a React Admin Panel. It is configured for deployment on Vercel as a monorepo.

## Environment Variables

### Backend & General
These variables should be set in the Vercel Project Settings for the backend function.

- `GO_ENV`: `production`
- `DATABASE_URL`: `postgres://user:password@host:port/dbname` (Your production PostgreSQL connection string)
- `JWT_SECRET`: `your-secure-jwt-secret-key` (Must be at least 32 characters)
- `STRIPE_SECRET_KEY`: `sk_live_...` (Your Stripe Secret Key)
- `STRIPE_WEBHOOK_SECRET`: `whsec_...` (Your Stripe Webhook Secret)
- `ALLOWED_ORIGINS`: `https://your-frontend-domain.com,https://your-admin-domain.com` (Comma-separated list of allowed origins)

### Frontend (Next.js)
These variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser.

- `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com/api` (The URL of your deployed backend)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...` (Your Stripe Publishable Key)

### Admin Panel (Vite)
These variables must be prefixed with `VITE_` to be available in the browser.

- `VITE_API_URL`: `https://your-backend-domain.com/api`

## Deployment Steps

### 1. Database Setup
- Provision a PostgreSQL database (e.g., Supabase, Neon, AWS RDS).
- Run the migrations (The backend automatically migrates on startup using GORM, but for production, consider using a migration tool if you need more control).
- Seed initial data if necessary.

### 2. Vercel Configuration
The project is configured with `vercel.json` to handle multi-path routing:
- `/api/*` -> Go Backend
- `/admin/*` -> Admin Panel (Vite)
- `/*` -> Frontend (Next.js)

### 3. Deploying to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login`
3. Run `vercel link` to link to your project.
4. Set up environment variables in the Vercel Dashboard or using `vercel env add`.
5. Run `vercel --prod` to deploy.

### 4. Verification
- **Frontend**: Visit the main domain. Check if tasks load and login works.
- **Admin**: Visit `/admin`. Login with admin credentials.
- **Backend**: Test `/api/health` or `/api/auth/me`.

## Security & Performance
- **SSL/TLS**: Vercel handles SSL automatically.
- **Headers**: Security headers (HSTS, CSP, X-Frame-Options) are configured in the backend middleware.
- **Database**: Connection pooling is configured in `backend/config/db.go`.
- **CORS**: Strict CORS policy is enforced based on `ALLOWED_ORIGINS`.

## Monitoring
- Check Vercel Logs for runtime errors.
- Monitor Database connection usage in your database provider's dashboard.
