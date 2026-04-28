#!/usr/bin/env bash
# TradeWind — one-shot local setup.
# Usage:
#   1. Copy the tradewind-marketplace/ folder onto your Mac (e.g. ~/Code/)
#   2. cd ~/Code/tradewind-marketplace
#   3. bash setup.sh
#
# What this does:
#   - Verifies prerequisites (node, git, gh, supabase CLI)
#   - npm install
#   - Initializes .env.local from the example
#   - Creates a private GitHub repo and pushes
#   - Prints next steps for Supabase + Stripe + Vercel

set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
say() { echo -e "${CYAN}▸${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn(){ echo -e "${YELLOW}⚠${NC} $1"; }
die() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── 1. Prereqs ────────────────────────────────────────────────────────────────
say "Checking prerequisites..."
command -v node      >/dev/null 2>&1 || die "node not found. Install Node 20+ from https://nodejs.org"
command -v npm       >/dev/null 2>&1 || die "npm not found."
command -v git       >/dev/null 2>&1 || die "git not found."
command -v gh        >/dev/null 2>&1 || warn "GitHub CLI (gh) not found — you'll create the repo manually."
command -v supabase  >/dev/null 2>&1 || warn "Supabase CLI not found — install with: brew install supabase/tap/supabase"

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\)\..*/\1/')
[ "$NODE_MAJOR" -ge 20 ] || die "Node 20+ required (you have $(node -v))."
ok "Prereqs look good."

# ── 2. Install ────────────────────────────────────────────────────────────────
say "Running npm install (this takes a minute)..."
npm install
ok "Dependencies installed."

# ── 3. Local env ──────────────────────────────────────────────────────────────
if [ ! -f .env.local ]; then
  say "Creating .env.local from .env.local.example..."
  cp .env.local.example .env.local
  ok ".env.local created — fill in Supabase + Stripe keys when ready."
else
  ok ".env.local already exists."
fi

# ── 4. Repair git if it was copied out of a sandbox ───────────────────────────
say "Validating git repo..."
git config user.email "${GIT_EMAIL:-$(git config --global user.email || echo "you@example.com")}" || true
git config user.name  "${GIT_NAME:-$(git config --global user.name  || echo "TradeWind")}" || true
git status >/dev/null 2>&1 || die "Not a git repo. Run: git init -b main && git add . && git commit -m 'init'"
ok "Git repo OK ($(git log --oneline | wc -l | tr -d ' ') commits)."

# ── 5. GitHub remote ──────────────────────────────────────────────────────────
if git remote get-url origin >/dev/null 2>&1; then
  ok "Remote 'origin' already set: $(git remote get-url origin)"
else
  if command -v gh >/dev/null 2>&1; then
    say "Creating private GitHub repo..."
    gh auth status >/dev/null 2>&1 || gh auth login
    gh repo create tradewind-marketplace --private --source=. --remote=origin --push
    ok "Repo created and pushed."
  else
    warn "Install gh, or do this manually:"
    cat <<'EOF'

    1. Create the repo at https://github.com/new (name: tradewind-marketplace, private)
    2. Then run:
         git remote add origin git@github.com:YOUR_USER/tradewind-marketplace.git
         git branch -M main
         git push -u origin main
EOF
  fi
fi

# ── 6. Typecheck + build ──────────────────────────────────────────────────────
say "Running typecheck + build..."
npm run typecheck
npm run build
ok "Build passed."

# ── 7. Next steps ─────────────────────────────────────────────────────────────
cat <<'EOF'

──────────────────────────────────────────────────────────────────────────────
  TradeWind · Phase 0 · LOCAL SETUP COMPLETE
──────────────────────────────────────────────────────────────────────────────

NEXT (do these in parallel):

  ▸ Supabase  →  https://supabase.com/dashboard/projects
       Create a project (region: closest to you).
       Copy: Settings → API → Project URL + anon key  → paste into .env.local
       Copy: service_role key → save for `supabase secrets set` later
       Storage → create buckets: listings-photos, listings-videos, avatars,
                                 dealer-assets, service-provider-assets, documents

  ▸ Stripe    →  https://dashboard.stripe.com/test/products
       Create 7 products + prices (see PRICING.md or §1L of the prompt)
       Developers → API keys → grab publishable + secret keys
       Add each price_xxx id to your secret notes

  ▸ Anthropic →  https://console.anthropic.com/settings/keys
       Create a key for TradeWind (do NOT put it in .env.local)

  ▸ Vercel    →  https://vercel.com/new
       Import your GitHub repo
       Add VITE_* env vars from your .env.local

THEN start Claude Code from this directory and paste tradewind-claude-code-prompt.md:

       claude

       (paste the prompt — it will pick up at Phase 1A)

For a faster preview right now without any backend wiring:
       npm run dev   →  http://localhost:5173

──────────────────────────────────────────────────────────────────────────────
EOF
