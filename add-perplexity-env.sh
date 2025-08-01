#!/bin/bash

# Script to add Perplexity API key to Vercel

echo "🤖 Adding Perplexity API Key to Vercel Environment Variables"
echo ""
echo "This script will help you add the PERPLEXITY_API_KEY to your Vercel project."
echo ""
echo "Steps:"
echo "1. Get your Perplexity API key from: https://www.perplexity.ai/settings/api"
echo "2. Go to your Vercel project settings: https://vercel.com/dashboard/project/the-ai-lab/settings/environment-variables"
echo "3. Add a new environment variable:"
echo "   - Key: PERPLEXITY_API_KEY"
echo "   - Value: Your Perplexity API key (starts with 'pplx-')"
echo "   - Environment: Production, Preview, Development"
echo ""
echo "After adding the key, redeploy your project for the changes to take effect."
echo ""
echo "Note: The blog generation will use Perplexity Sonar model for fast web search when this key is configured."