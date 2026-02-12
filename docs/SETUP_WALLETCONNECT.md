# WalletConnect Setup Guide

## Why You Need a WalletConnect Project ID

ArbShield uses RainbowKit for wallet connections, which requires a WalletConnect Project ID. This is **free** and takes less than 2 minutes to set up.

## Quick Setup (2 minutes)

### Step 1: Create Account
1. Go to https://cloud.walletconnect.com
2. Click "Sign Up" (or "Sign In" if you have an account)
3. Sign up with GitHub, Google, or Email

### Step 2: Create Project
1. Click "Create New Project"
2. Enter project details:
   - **Name**: ArbShield (or any name)
   - **Type**: App
   - **Platform**: Web
3. Click "Create"

### Step 3: Get Project ID
1. You'll see your Project ID on the dashboard
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. Copy this ID

### Step 4: Add to .env.local
1. Open `.env.local` in your project
2. Replace the placeholder with your real Project ID:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```
3. Save the file

### Step 5: Restart Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ✅ Done!

Your wallet connection will now work properly with RainbowKit.

## Troubleshooting

### "Invalid Project ID" Error
- Make sure you copied the entire Project ID
- No spaces before or after the ID
- The ID should be 64 characters long

### Wallet Not Connecting
- Check browser console for errors
- Make sure you're using HTTPS in production
- Try clearing browser cache

## Free Tier Limits

WalletConnect free tier includes:
- ✅ Unlimited wallet connections
- ✅ All wallet types supported
- ✅ Perfect for development and production

## Alternative: Use Placeholder (Development Only)

The current placeholder ID in `.env.local` will let the app start, but wallet connections won't work. This is fine for:
- Viewing the UI
- Testing non-wallet features
- Development without wallet connection

For full functionality, you need a real Project ID.

## Need Help?

- WalletConnect Docs: https://docs.walletconnect.com
- RainbowKit Docs: https://www.rainbowkit.com/docs/installation
- ArbShield Issues: Create an issue in the repo
