# Deployment Checklist — Dragon Seats Inventory

Use this checklist to track your progress through each deployment phase. Check off items as you complete them.

## Pre-Flight (Before Starting)
- [ ] AWS account ready and logged in
- [ ] GitHub repo: `dragon-seats-inventory` accessible
- [ ] Credit/debit card ready for domain purchase (~$10-12)
- [ ] Know your local DATABASE_URL from `.env` file (for reference)

## Phase 1: Domain Registration (Cloudflare)
- [ ] Create Cloudflare account at cloudflare.com
- [ ] Verify email address
- [ ] Go to Domain Registration → Register Domain
- [ ] Search for and purchase `tech-dragonseats.com` (~$10-12/year)
- [ ] Domain is now registered with DNS managed by Cloudflare

## Phase 2: Database Setup (Amazon RDS)
- [ ] Open AWS Console → search "RDS" → confirm region is **US East (N. Virginia) us-east-1**
- [ ] Click "Create database" → "Standard create"
- [ ] Engine: PostgreSQL 16.x
- [ ] Template: Free tier (if eligible) or Production
- [ ] DB identifier: `dragon-seats-db`
- [ ] Master username: `postgres`
- [ ] Master password: _____________ (WRITE THIS DOWN!)
- [ ] Instance: db.t4g.small | Storage: 20 GB gp3 | Autoscaling: ON (max 50 GB)
- [ ] Single DB instance (not Multi-AZ)
- [ ] Connectivity: Default VPC | Public access: **NO** | New security group: `dragon-seats-db-sg` | Port: 5432
- [ ] Initial database name: `dragon_seats_inventory`
- [ ] Backups: ON (7 days) | Encryption: ON | Deletion protection: ON
- [ ] Click "Create database" and wait ~5-10 min
- [ ] Configure security group: Inbound rule → PostgreSQL, port 5432, source VPC CIDR (`172.31.0.0/16`)
- [ ] Copy the RDS **Endpoint** once status shows "Available"
- [ ] Build your connection string: `postgresql://postgres:YOUR_PASSWORD@ENDPOINT:5432/dragon_seats_inventory?sslmode=require`
- [ ] Save this connection string somewhere safe!

## Phase 3: Deploy the App (AWS Amplify)
- [ ] AWS Console → search "Amplify" → "Create new app"
- [ ] Source: GitHub → Authorize → Select `dragon-seats-inventory` repo, `main` branch
- [ ] Verify build settings auto-detected from `amplify.yml`
- [ ] Confirm Platform is set to **"Web compute"** (NOT "Web static")
- [ ] Add environment variables:
  - `DATABASE_URL` = your connection string from Phase 2
  - `NEXT_PUBLIC_APP_URL` = `https://inventory.tech-dragonseats.com`
- [ ] Configure VPC: Same VPC as RDS, select 2+ private subnets, security group with outbound to RDS on port 5432
- [ ] Click Deploy and wait for build to complete
- [ ] Copy the Amplify default URL (e.g., `https://main.d1234abcde.amplifyapp.com`)
- [ ] Verify the app loads at the default Amplify URL

## Phase 4: Connect Domain (Cloudflare → Amplify)
- [ ] Cloudflare → `tech-dragonseats.com` → DNS → Add record:
  - Type: CNAME | Name: `inventory` | Target: Amplify URL (without https://) | Proxy: **DNS only (gray cloud)**
- [ ] Amplify Console → Custom domains → Add domain → "Use third-party DNS provider"
  - Domain: `tech-dragonseats.com` | Subdomain: `inventory` | Branch: `main`
- [ ] Copy the verification CNAME from Amplify
- [ ] Cloudflare → DNS → Add verification record:
  - Type: CNAME | Name: `_cname.inventory` | Target: verification value | Proxy: **DNS only**
- [ ] Wait 15-30 min for Amplify to verify and issue SSL certificate (status → "Available")
- [ ] Cloudflare → DNS → Toggle `inventory` CNAME proxy to **orange (Proxied)**
- [ ] Cloudflare → SSL/TLS → Set encryption mode to **"Full"**

## Phase 5: Authentication (Cloudflare Zero Trust)
- [ ] Cloudflare → Zero Trust (left sidebar) → Set team name: `dragonseats` → Free plan
- [ ] Settings → Authentication → Verify "One-time PIN" is listed as a login method
- [ ] Access → Applications → Add application → "Self-hosted"
  - Name: `Dragon Seats Inventory`
  - Session: 24 hours
  - Domain: subdomain `inventory` / domain `tech-dragonseats.com`
- [ ] Create policy: "Allow Dragon Seats Team"
  - Action: Allow
  - Include: Emails ending in `@dragonseats.com`
- [ ] Click "Add application"
- [ ] TEST: Open incognito window → go to `https://inventory.tech-dragonseats.com`
  - [ ] See Cloudflare login screen (not the app)
  - [ ] Enter @dragonseats.com email → receive PIN via email
  - [ ] Enter PIN → app loads

## Phase 6: Database Migrations
- [ ] GitHub repo → Settings → Secrets → Actions → Add secret:
  - Name: `DATABASE_URL`
  - Value: your production connection string
- [ ] Push any commit to `main` → CI `migrate` job runs automatically
- [ ] Verify migration succeeded in GitHub Actions logs

## Phase 7: Final Verification
- [ ] Authentication works (incognito → login screen → PIN → app)
- [ ] Non-@dragonseats.com emails are rejected
- [ ] All pages load with real data
- [ ] Create/edit a record successfully
- [ ] Login works on mobile phone browser
- [ ] Browser shows lock icon (HTTPS working)

## Post-Deployment
- [ ] Set up AWS Budget alert at $75/month (AWS Billing → Budgets)
- [ ] Bookmark: AWS Amplify console, Cloudflare dashboard, RDS console
- [ ] Share URL with team: `inventory.tech-dragonseats.com`
