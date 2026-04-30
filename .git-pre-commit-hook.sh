#!/bin/bash
# Pre-commit hook to prevent committing sensitive files
# Copy this to: .git/hooks/pre-commit and run: chmod +x .git/hooks/pre-commit

echo "🔍 Checking for sensitive files..."

# Check for .env files (should never be committed)
if git diff --cached --name-only | grep -E '\.env(\.|$)' | grep -v '\.env\.example'; then
  echo "❌ ERROR: Attempting to commit .env file!"
  echo "Use .env.example for template instead"
  exit 1
fi

# Check for AWS credentials pattern
if git diff --cached -S 'AKIA' --source HEAD; then
  echo "❌ ERROR: Possible AWS credentials detected!"
  exit 1
fi

# Check for JWT secrets
if git diff --cached -S 'JWT_SECRET' --source HEAD | grep -v '.env.example'; then
  echo "❌ ERROR: Possible JWT_SECRET in non-example file!"
  exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
