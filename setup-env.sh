#!/bin/bash

# Environment Setup Script for thehackai
# This script helps set up environment variables safely

echo "🔐 thehackai Environment Setup"
echo "=============================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Copy .env.example to .env.local
if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
else
    echo "❌ .env.example not found! Make sure you're in the project root directory."
    exit 1
fi

echo ""
echo "📝 Next Steps:"
echo "1. Edit .env.local and fill in your real API keys"
echo "2. Never commit .env.local to Git (it's already in .gitignore)"
echo "3. Get your API keys from:"
echo "   - Supabase: https://app.supabase.com → Your Project → Settings → API"
echo "   - Stripe: https://dashboard.stripe.com → Developers → API keys"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - Perplexity: https://www.perplexity.ai/settings/api"
echo ""
echo "4. Start the development server: npm run dev"
echo ""
echo "📚 For detailed setup instructions, see ENVIRONMENT_SETUP.md"
echo ""
echo "⚠️  SECURITY REMINDER: Never share your .env.local file or commit it to Git!"