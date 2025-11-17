# Deployment Guide

This guide covers deploying Exerciser to production.

## Architecture Overview

```
┌──────────────────────────────────────┐
│ Vercel (Next.js Frontend)            │
│ - Serverless functions               │
│ - Automatic HTTPS                    │
│ - Global CDN                         │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ Neon (PostgreSQL Database)           │
│ - Serverless Postgres                │
│ - Auto-scaling                       │
│ - Connection pooling                 │
└───────────────▲──────────────────────┘
                │
                │
┌───────────────┴──────────────────────┐
│ VPS/Docker (Scraper Service)         │
│ - Railway, Fly.io, or DigitalOcean   │
│ - Runs scheduler                     │
│ - Updates database every 30min       │
└──────────────────────────────────────┘
```

## Step 1: Deploy Database to Neon

### Create Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project: "exerciser"
3. Copy connection string from dashboard
4. Save as `DATABASE_URL`

### Run Migrations

```bash
# Update shared/.env with Neon connection string
echo 'DATABASE_URL="postgresql://user:pass@host.neon.tech/exerciser"' > shared/.env

# Run migrations
cd shared
npx prisma migrate deploy
```

### Seed Production Database

```bash
cd scraper-service

# Update .env with Neon connection string
echo 'DATABASE_URL="postgresql://user:pass@host.neon.tech/exerciser"' > .env

# Seed studios
npm run seed

# Fetch initial class data
npm run scrape:all
```

## Step 2: Deploy Frontend to Vercel

### Via GitHub (Recommended)

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `exerciser-next`
   - **Build Command**: `npm run build`
   - **Output Directory**: (default)
6. Add Environment Variable:
   - `DATABASE_URL`: Your Neon connection string
7. Deploy!

### Via Vercel CLI

```bash
cd exerciser-next

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable
vercel env add DATABASE_URL production
# Paste your Neon connection string

# Deploy to production
vercel --prod
```

## Step 3: Deploy Scraper Service

### Option A: Railway

1. Visit [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select `scraper-service/` as root directory
4. Add environment variables:
   ```
   DATABASE_URL=<your-neon-connection-string>
   ```
5. Deploy settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Deploy!

### Option B: Fly.io

```bash
cd scraper-service

# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create fly.toml
cat > fly.toml << 'EOF'
app = "exerciser-scraper"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
EOF

# Set secrets
fly secrets set DATABASE_URL="<your-neon-connection-string>"

# Deploy
fly deploy
```

### Option C: Docker + DigitalOcean

```bash
cd scraper-service

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source
COPY . .

# Start application
CMD ["npm", "start"]
EOF

# Build and push to Docker Hub
docker build -t yourusername/exerciser-scraper .
docker push yourusername/exerciser-scraper

# Deploy to DigitalOcean
# 1. Create new Droplet
# 2. SSH into droplet
# 3. Install Docker
# 4. Run:
docker run -d \
  --name exerciser-scraper \
  --restart unless-stopped \
  -e DATABASE_URL="<your-neon-connection-string>" \
  yourusername/exerciser-scraper
```

### Option D: Keep Running Locally

For personal use, you can keep the scraper running on your local machine:

```bash
cd scraper-service

# Update .env with Neon connection string
vim .env  # Update DATABASE_URL

# Run in background (macOS/Linux)
nohup npm start &

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name exerciser-scraper -- start
pm2 save
pm2 startup  # Configure to start on boot
```

## Step 4: Verify Deployment

### Check Frontend

1. Visit your Vercel URL
2. Verify classes are loading
3. Test filters and search
4. Check mobile responsiveness

### Check Scraper

```bash
# View logs on Railway
railway logs

# View logs on Fly.io
fly logs

# Check database for recent updates
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"FitnessClass\";"
psql $DATABASE_URL -c "SELECT * FROM \"ScrapeLog\" ORDER BY \"startedAt\" DESC LIMIT 5;"
```

### Monitor Cron Job

The scraper should run every 30 minutes. Verify by checking `ScrapeLog` table:

```sql
SELECT brand, status, "classCount", "startedAt"
FROM "ScrapeLog"
ORDER BY "startedAt" DESC
LIMIT 10;
```

## Environment Variables Reference

### Frontend (Vercel)

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/exerciser?sslmode=require
```

### Scraper Service (Railway/Fly.io/Docker)

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/exerciser?sslmode=require
NODE_ENV=production
```

## Scaling Considerations

### Database (Neon)

- Free tier: 0.5 GB storage, autoscaling compute
- Paid tier: Scales automatically based on load
- Connection pooling enabled by default

### Frontend (Vercel)

- Serverless functions scale automatically
- 100 GB bandwidth on free tier
- Upgrade to Pro for more bandwidth

### Scraper Service

- Single instance sufficient for 13 studios
- Each scrape cycle takes ~5-10 seconds
- CPU/memory requirements are minimal
- Can run on smallest VPS tier ($5-6/month)

## Monitoring

### Recommended Tools

1. **Sentry** - Error tracking
   ```bash
   npm install @sentry/nextjs
   # Configure in next.config.js
   ```

2. **Vercel Analytics** - Frontend monitoring
   ```bash
   npm install @vercel/analytics
   # Add to layout.tsx
   ```

3. **Neon Dashboard** - Database monitoring
   - Query performance
   - Connection pool usage
   - Storage usage

4. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com/)
   - [Pingdom](https://www.pingdom.com/)
   - Check /api/classes endpoint every 5 minutes

## Costs Estimate

### Development (Free)
- PostgreSQL: Local
- Next.js: Local
- Scraper: Local
**Total: $0/month**

### Production (Minimal)
- Neon: $0 (free tier)
- Vercel: $0 (hobby tier)
- Scraper: $0 (local) or $5-6 (VPS)
**Total: $0-6/month**

### Production (Scaled)
- Neon Pro: $19/month
- Vercel Pro: $20/month
- Railway/Fly.io: $5-10/month
- Monitoring: $0-10/month
**Total: ~$50-60/month**

## Troubleshooting

### Frontend Issues

**Classes not loading**
- Check DATABASE_URL in Vercel environment variables
- Verify Neon database is accessible
- Check Vercel function logs

**Build failures**
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are in package.json

### Scraper Issues

**Scraper not running**
- Check process is running: `ps aux | grep npm`
- View logs for errors
- Verify DATABASE_URL is set correctly

**No new classes appearing**
- Check ScrapeLog table for errors
- Verify cron schedule is correct
- Run manual scrape: `npm run scrape:all`

### Database Issues

**Connection errors**
- Verify connection string format
- Check Neon project is active
- Ensure IP is allowlisted (if using IP restrictions)

**Slow queries**
- Add indexes on frequently queried columns
- Use Neon dashboard to identify slow queries
- Consider connection pooling

## Security Checklist

- [ ] DATABASE_URL stored as environment variable (never in code)
- [ ] SSL/TLS enabled for database connections
- [ ] Vercel environment variables set to "production" only
- [ ] Studio credentials (if any) stored securely
- [ ] API routes use proper input validation
- [ ] Rate limiting on public endpoints
- [ ] CORS configured correctly

## Support

For issues or questions:
1. Check logs first
2. Review troubleshooting section
3. Check GitHub issues
4. Contact maintainers

---

**Ready to deploy!** 🚀
