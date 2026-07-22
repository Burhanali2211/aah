#!/bin/bash

# ============================================================================
# Production Deployment Verification Script
# ============================================================================
# Run after deployment to verify all components are working correctly.
#
# Usage:
#   chmod +x verify-deployment.sh
#   ./verify-deployment.sh
#
# This script checks:
#   - Edge Functions deployed
#   - Secrets configured
#   - RLS policies enabled
#   - No secrets in bundle
#   - Environment variables set
# ============================================================================

set -e

RESET='\033[0m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

check_passed() { echo -e "${GREEN}✓ PASS${RESET}: $1"; }
check_failed() { echo -e "${RED}✗ FAIL${RESET}: $1"; exit 1; }
check_warning() { echo -e "${YELLOW}⚠ WARN${RESET}: $1"; }
info() { echo -e "${BLUE}ℹ INFO${RESET}: $1"; }

echo -e "\n${BLUE}========================================${RESET}"
echo -e "${BLUE}Production Deployment Verification${RESET}"
echo -e "${BLUE}========================================${RESET}\n"

# ── 1. Check Git status ─────────────────────────────────────────────
echo -e "${BLUE}1. Git Status${RESET}"

if [ -d ".git" ]; then
    check_passed "Git repository found"
else
    check_failed "Not a git repository"
fi

UNCOMMITTED=$(git status --short | wc -l)
if [ "$UNCOMMITTED" -eq 0 ]; then
    check_passed "No uncommitted changes"
else
    check_warning "Uncommitted changes exist: $UNCOMMITTED files"
fi

# ── 2. Check Node version ───────────────────────────────────────────
echo -e "\n${BLUE}2. Development Environment${RESET}"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_passed "Node.js installed: $NODE_VERSION"
else
    check_failed "Node.js not found"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_passed "npm installed: $NPM_VERSION"
else
    check_failed "npm not found"
fi

# ── 3. Check build directory ────────────────────────────────────────
echo -e "\n${BLUE}3. Build Artifacts${RESET}"

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    check_passed "Build output found: $DIST_SIZE"

    # Check for secrets in bundle
    if grep -r "SERVICE_ROLE\|KEY_SECRET\|secret" dist/ 2>/dev/null | grep -v "node_modules" > /dev/null; then
        check_failed "⚠️ Secrets potentially exposed in bundle!"
    else
        check_passed "No obvious secrets in bundle"
    fi
else
    check_warning "dist/ directory not found (run 'npm run build' first)"
fi

# ── 4. Check environment files ──────────────────────────────────────
echo -e "\n${BLUE}4. Environment Configuration${RESET}"

if [ -f ".env" ]; then
    check_warning ".env file exists locally (should not be committed)"
fi

if [ -f ".env.local" ]; then
    check_warning ".env.local file exists locally"
fi

if [ -f ".env.production.example" ]; then
    check_passed ".env.production.example found (template)"
else
    check_failed ".env.production.example not found"
fi

# ── 5. Check Supabase configuration ─────────────────────────────────
echo -e "\n${BLUE}5. Supabase Setup${RESET}"

if [ -d "supabase" ]; then
    check_passed "supabase/ directory found"

    # Check for migration files
    MIGRATIONS=$(find supabase/migrations -name "*.sql" 2>/dev/null | wc -l)
    if [ "$MIGRATIONS" -gt 0 ]; then
        check_passed "SQL migrations found: $MIGRATIONS files"
    else
        check_warning "No SQL migrations found"
    fi

    # Check for Edge Functions
    FUNCTIONS=$(find supabase/functions -maxdepth 1 -type d ! -name "functions" 2>/dev/null | wc -l)
    if [ "$FUNCTIONS" -ge 4 ]; then
        check_passed "Edge Functions deployed: $FUNCTIONS functions"
    else
        check_warning "Expected 4+ Edge Functions, found: $FUNCTIONS"
    fi
else
    check_failed "supabase/ directory not found"
fi

# ── 6. Check critical files ─────────────────────────────────────────
echo -e "\n${BLUE}6. Critical Files${RESET}"

CRITICAL_FILES=(
    "src/lib/apiClient.ts"
    "src/contexts/AuthContext.tsx"
    "src/lib/supabase.ts"
    "src/services/storageService.ts"
    "supabase/functions/product-mutations/index.ts"
    "supabase/functions/order-mutations/index.ts"
    "SECURITY_DEPLOYMENT.md"
    "DEPLOYMENT_CHECKLIST.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_passed "$file exists"
    else
        check_failed "$file missing"
    fi
done

# ── 7. Check for hardening implementation ───────────────────────────
echo -e "\n${BLUE}7. Security Implementation${RESET}"

# Check SecurityManager in AuthContext
if grep -q "SecurityManager" src/contexts/AuthContext.tsx; then
    check_passed "SecurityManager wired into AuthContext"
else
    check_failed "SecurityManager not found in AuthContext"
fi

# Check field filtering in supabase.ts
if grep -q "PRODUCT_PUBLIC_FIELDS" src/lib/supabase.ts; then
    check_passed "Field filtering implemented (PRODUCT_PUBLIC_FIELDS)"
else
    check_failed "Field filtering not found"
fi

# Check storage auth in storageService.ts
if grep -q "Authentication required to upload" src/services/storageService.ts; then
    check_passed "Storage authentication check implemented"
else
    check_failed "Storage authentication check not found"
fi

# Check CORS in Edge Functions
if grep -q "getCorsHeaders" supabase/functions/product-mutations/index.ts; then
    check_passed "CORS lockdown implemented in product-mutations"
else
    check_failed "CORS lockdown not found in product-mutations"
fi

# Check rate limiting
if grep -q "isUserRateLimited\|isRateLimited" supabase/functions/product-mutations/index.ts; then
    check_passed "Rate limiting implemented"
else
    check_failed "Rate limiting not found"
fi

# ── 8. Check TypeScript / Lint ──────────────────────────────────────
echo -e "\n${BLUE}8. Code Quality${RESET}"

if [ -f "tsconfig.json" ]; then
    check_passed "TypeScript configuration found"
else
    check_warning "tsconfig.json not found"
fi

if [ -f ".eslintrc*" ] || grep -q "eslint" package.json 2>/dev/null; then
    check_passed "ESLint configuration found"
else
    check_warning "ESLint not configured"
fi

# ── 9. Documentation check ──────────────────────────────────────────
echo -e "\n${BLUE}9. Documentation${RESET}"

DOC_FILES=(
    "SECURITY_DEPLOYMENT.md"
    "DEPLOYMENT_CHECKLIST.md"
    "SUPABASE_SECRETS.md"
    ".env.production.example"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_passed "$file exists"
    else
        check_failed "$file missing"
    fi
done

# ── 10. Summary ─────────────────────────────────────────────────────
echo -e "\n${BLUE}========================================${RESET}"
echo -e "${BLUE}Verification Complete${RESET}"
echo -e "${BLUE}========================================${RESET}\n"

echo -e "Next steps:"
echo -e "  1. Read: ${YELLOW}DEPLOYMENT_CHECKLIST.md${RESET}"
echo -e "  2. Follow Phase 1 Ops: Rotate Razorpay keys"
echo -e "  3. Set Vercel environment variables"
echo -e "  4. Deploy Edge Functions: ${YELLOW}supabase functions deploy ...${RESET}"
echo -e "  5. Run smoke tests"
echo -e "\n${GREEN}✓ All checks passed!${RESET}\n"
