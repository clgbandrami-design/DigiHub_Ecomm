# DigiHub

DigiHub is a MERN marketplace for digital products like templates, graphics, code assets, and other downloadable resources.

## Stack

- Frontend: React 19 + Vite + React Router
- Backend: Express + MongoDB + Mongoose
- Auth: JWT, email OTP verification, Google OAuth
- Payments: Razorpay

## Active App Structure

- `frontend/`: active React client
- `server/`: Express API and MongoDB models
- `client/`: older experiment / legacy folder, not the active app right now

## Features Implemented

- Product browsing, category filtering, sorting, and search
- Product details with reviews
- Email verification flow for registration
- Login with email/password and optional Google OAuth
- Cart and Razorpay checkout
- Orders history
- Purchased downloads library
- Seller onboarding, product management, and seller analytics
- Admin dashboard for stats, users, and products
- Verified-purchase review badges

## Run Locally

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../server && npm install
```

### 2. Configure environment variables

Copy the example env files and fill in your real values:

- `frontend/.env.example` -> `frontend/.env`
- `server/.env.example` -> `server/.env`

### 3. Start the backend

```bash
cd server
npm run dev
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` and the API is expected on `http://localhost:5000`.

## Important Environment Variables

### Frontend

- `VITE_API_URL`: backend base URL for deployed environments

### Server

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `MSG91_AUTH_KEY`
- `MSG91_TEMPLATE_ID`

## Current Focus

This repo is being stabilized as a portfolio-quality full-stack project. The current emphasis is:

- frontend reliability and lint cleanliness
- stronger buyer flow from purchase to download
- real seller/admin workflows
- clearer docs and local setup
