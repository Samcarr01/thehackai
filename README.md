# thehackai - AI Tools & Playbooks Platform

> Subscription platform for curated AI documents and GPTs with battle-tested workflows that actually work.

**🚀 Live Site:** [https://thehackai.com](https://thehackai.com)

## Overview

thehackai is a freemium SaaS platform providing curated AI tools, playbooks, and GPTs across three tiers (Free/Pro/Ultra). Features include:

- **AI GPTs Collection** - Direct ChatGPT integrations with tier-based access control
- **AI Playbooks** - Downloadable PDF guides with proven strategies  
- **Content Management** - Admin panel with AI-powered content analysis
- **Subscription System** - Stripe-powered billing with automatic tier management
- **Blog Generation** - AI-powered content creation with web search and image generation

## Architecture

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Next.js API routes (App Router)  
- **Database:** PostgreSQL via Supabase with Row Level Security
- **Authentication:** Supabase Auth (PKCE flow)
- **Payments:** Stripe subscriptions with webhook handling
- **Email:** Brevo API integration with tier-based lists
- **AI Services:** OpenAI GPT-4o + DALL-E 3, Perplexity Sonar
- **Deployment:** Vercel with automatic GitHub deployments

## Prerequisites

- **Node.js:** 18+ (tested with v22.17.0)
- **Package Manager:** npm or yarn
- **Supabase Account:** For database and authentication
- **Stripe Account:** For payment processing
- **OpenAI API Key:** For AI content generation
- **Perplexity API Key:** For web search functionality
- **Brevo Account:** For email marketing

## Quick Start

### 1. Install Dependencies

```bash
git clone <repository-url>
cd the-ai-lab
npm install
```

### 2. Environment Setup

Create `.env.local` with required variables:

```bash
# Core Platform (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI Services (Required)
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key

# Payments (Required)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Marketing (Required)
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=hello@thehackai.com

# Optional: Stripe Price IDs for subscriptions
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ULTRA_PRICE_ID=price_xxx
```

### 3. Database Setup

Run the database migrations in Supabase SQL Editor:

```sql
-- See CLAUDE.md for complete database schema
-- Key tables: users, gpts, documents, blog_posts, affiliate_tools
```

### 4. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Build & Test

```bash
npm run build          # Production build
npm run type-check     # TypeScript validation  
npm run lint           # ESLint checking
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | - | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | - | Supabase service role key (admin) |
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key for GPT-4o + DALL-E |
| `PERPLEXITY_API_KEY` | ✅ | - | Perplexity API key for web search |
| `STRIPE_SECRET_KEY` | ✅ | - | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | - | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | - | Stripe webhook endpoint secret |
| `BREVO_API_KEY` | ✅ | - | Brevo API key for email marketing |
| `BREVO_FROM_EMAIL` | ✅ | - | Default sender email address |
| `NEXT_PUBLIC_SITE_URL` | ✅ | - | Full site URL (with protocol) |
| `STRIPE_PRO_PRICE_ID` | ❌ | - | Stripe price ID for Pro plan |
| `STRIPE_ULTRA_PRICE_ID` | ❌ | - | Stripe price ID for Ultra plan |

### User Tiers

- **Free:** Blog access, content previews only
- **Pro (£7/month):** 3 GPTs, 2 playbooks, email support  
- **Ultra (£19/month):** All content, priority support, early access

## API Reference

### Authentication

All API routes use Supabase authentication. Admin routes require `samcarr1232@gmail.com`.

### Key Endpoints

**Contact Form**
```bash
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "subject": "Question",
  "message": "Hello world"
}

# Response: 200 OK
{
  "success": true,
  "message": "Thank you for your message! We'll get back to you soon."
}
```

**Stripe Checkout**
```bash
POST /api/stripe/create-checkout-session
Content-Type: application/json
Cookie: supabase-auth-token=xxx

{
  "priceId": "price_xxx",
  "tier": "pro"
}

# Response: 200 OK  
{
  "sessionUrl": "https://checkout.stripe.com/xxx"
}
```

**Admin Content Management**
```bash
GET /api/admin/content
Cookie: supabase-auth-token=xxx

# Response: 200 OK
{
  "success": true,
  "content": [
    {
      "id": "uuid",
      "title": "GPT Title", 
      "type": "gpt",
      "is_featured": false
    }
  ]
}
```

### Error Responses

```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (admin access required)
- `500` - Internal Server Error

## Security

### Authentication & Authorization
- Supabase PKCE flow for secure authentication
- Admin routes protected with email-based access control
- Row Level Security (RLS) enabled on all database tables

### Data Protection  
- All API keys stored as environment variables
- Security headers: HSTS, X-Frame-Options, CSP directives
- Input validation and sanitization on all forms
- Rate limiting on API endpoints

### Secrets Management
- **Never commit** API keys or secrets to repository
- Use `.env.local` for local development
- Use Vercel environment variables for production
- Rotate keys regularly and monitor usage

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Deploy automatically on push to main branch
   vercel --prod
   ```

2. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Set `NEXT_PUBLIC_SITE_URL` to production domain

3. **Domain Configuration**
   - Configure custom domain: `thehackai.com`
   - SSL certificates handled automatically

### Database Deployment
- Supabase handles database hosting and backups
- Row Level Security policies protect data access
- Admin user: `samcarr1232@gmail.com` (hardcoded)

### Stripe Webhooks
Configure webhook endpoint in Stripe dashboard:
```
https://thehackai.com/api/stripe/webhook
```

Events to monitor:
- `checkout.session.completed`
- `customer.subscription.updated` 
- `customer.subscription.deleted`

## Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables"**
```bash
# Solution: Check .env.local file exists with correct values
cat .env.local | grep SUPABASE
```

**2. "Stripe webhook signature invalid"** 
```bash
# Solution: Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard
echo $STRIPE_WEBHOOK_SECRET
```

**3. "Database connection failed"**
- Check Supabase project is active and not paused
- Verify RLS policies allow appropriate access
- Check service role key has correct permissions

**4. "Build fails with TypeScript errors"**
```bash
npm run type-check  # Check specific errors
```

**5. "Admin panel access denied"**
- Only `samcarr1232@gmail.com` has admin access
- Ensure user is authenticated with correct email

### Debug Endpoints

Development endpoints for troubleshooting:

- `/api/debug/system-status` - Overall system health
- `/api/debug/supabase-test` - Database connectivity  
- `/api/debug/brevo-config` - Email service status
- `/api/debug/admin-status` - Admin panel diagnostics

### Performance Issues

- Blog generation: 30-45 seconds (optimised from 170s)
- Image generation: Uses permanent Supabase Storage
- Rate limiting: Implemented to prevent API abuse

## Development

### Code Structure
```
src/
├── app/                 # Next.js 14 app router
│   ├── api/            # API routes
│   ├── admin/          # Admin panel
│   └── (pages)/        # Public pages
├── components/         # React components
├── lib/               # Utilities & services
└── styles/           # Global styles
```

### Testing
```bash
npm run lint           # ESLint
npm run type-check     # TypeScript
npm run build         # Build verification
```

### Admin Workflows
- Admin email: `samcarr1232@gmail.com`
- Access admin panel: `/admin`
- Content management: AI-powered analysis
- Blog generation: Integrated OpenAI + Perplexity

## License

ISC License - see package.json

## Changelog

### v1.0.0 (Latest)
- ✅ Complete codebase cleanup and security hardening
- ✅ Fixed database schema consistency across all endpoints
- ✅ Standardized loading states to consistent dark theme
- ✅ Added comprehensive security headers and admin authentication
- ✅ Optimized blog generation system (95% cost reduction)
- ✅ Implemented permanent image storage for DALL-E images

---

For detailed development context and business logic, see `CLAUDE.md`.