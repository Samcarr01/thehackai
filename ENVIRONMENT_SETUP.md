# Environment Variables Setup Guide

## 🔐 Security Notice
**NEVER commit .env files to Git!** This repository has been cleaned of all .env files containing sensitive credentials. The .gitignore file now prevents accidental commits of environment files.

## 📋 Required Environment Variables

### Development Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the real values in `.env.local` (this file stays local and is never committed)

### Environment Variables Explained

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```
- Get these from your Supabase project dashboard → Settings → API

#### Stripe Configuration (for payments)
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRO_PRICE_ID=price_pro_monthly
STRIPE_ULTRA_PRICE_ID=price_ultra_monthly
```
- Get these from your Stripe dashboard → Developers → API keys
- Create price IDs in Stripe dashboard → Products

#### AI Service Keys
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
PERPLEXITY_API_KEY=pplx-your_perplexity_api_key_here
```
- OpenAI: https://platform.openai.com/api-keys
- Perplexity: https://www.perplexity.ai/settings/api

#### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
NEXT_PUBLIC_SITE_URL=https://yourdomain.com  # Production
```

## 🚀 Production Deployment (Vercel)

### Environment Variables in Vercel Dashboard
For production, configure all environment variables in the Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all the variables from your `.env.local` file
4. Use production values (not test/development keys)

### Production-Specific Values
- Use Stripe live keys (`sk_live_...` instead of `sk_test_...`)
- Use production Supabase project if different from development
- Set `NEXT_PUBLIC_SITE_URL` to your actual domain

## ⚠️ Security Best Practices

### Development
- ✅ Keep `.env.local` on your local machine only
- ✅ Never share .env files via email, Slack, or any communication tool
- ✅ Use test/development keys for local development
- ✅ Regularly rotate API keys

### Production
- ✅ Use Vercel's environment variables dashboard (already secure)
- ✅ Use separate production API keys
- ✅ Enable webhook endpoint security
- ✅ Monitor for unauthorized access

### Git Repository
- ✅ .env files are now properly excluded via .gitignore
- ✅ No sensitive credentials exist in Git history (after cleanup)
- ✅ Only .env.example with safe placeholder values is tracked

## 🔧 Troubleshooting

### Missing Environment Variables
If you see errors about missing environment variables:

1. Check that `.env.local` exists in project root
2. Verify all required variables are set
3. Restart your development server (`npm run dev`)
4. Check Vercel dashboard for production deployments

### Invalid API Keys
- Verify keys are correctly copied (no extra spaces)
- Check that keys haven't expired
- Ensure you're using the correct environment (test vs live)

## 📞 Getting Help

If you need API keys or have setup questions:
1. Check the official documentation for each service
2. Verify your account has the necessary permissions
3. Contact the service provider's support if needed

## 🏁 Quick Start Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required environment variables
- [ ] Test local development server (`npm run dev`)
- [ ] Configure production environment variables in Vercel dashboard
- [ ] Test production deployment

**Remember: Never commit `.env.local` or any file containing real API keys!**