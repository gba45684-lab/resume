#!/bin/bash
set -e

MSG="${1:-Auto-update resume studio}"
URL="https://resume-rho-six-33.vercel.app/"

echo "🚀 Staging and committing changes..."
git add .
git commit -m "$MSG" || echo "No changes to commit."

echo "⬆️ Pushing to GitHub..."
git push origin main

# Copy production URL to Android clipboard
termux-clipboard-set "$URL"

# Haptic buzz & system notification
termux-vibrate -d 200
termux-notification \
  --title "🚀 Deployment Pushed!" \
  --content "Pushed '$MSG'. Live URL copied to clipboard." \
  --priority high

echo "✅ Done! URL copied to clipboard: $URL"
