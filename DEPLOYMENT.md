# Vercel Deployment Guide

## Environment Variables Setup

In your Vercel project settings, add these environment variables:

### Required Variables

1. **DATABASE_URL**
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
   - Use a production PostgreSQL database (e.g., Vercel Postgres, Supabase, Neon, Railway)
   - Make sure to include `?sslmode=require` for secure connections

2. **NEXTAUTH_SECRET**
   ```bash
   # Generate a secure random string (32+ characters)
   openssl rand -base64 32
   ```
   - Use the same secret across all environments for consistent session handling
   - **IMPORTANT**: Keep this secret and never commit it to git

3. **NEXTAUTH_URL**
   - **Leave this BLANK or don't set it at all**
   - Vercel automatically sets this via `VERCEL_URL`
   - NextAuth.js will auto-detect the correct URL in production

### Optional Variables (if using OAuth providers)

If you add Google/GitHub/etc. login later:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- etc.

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project → Storage → Create Database
2. Select "Postgres"
3. Vercel will automatically set `DATABASE_URL` environment variable
4. Run migrations after deployment (see below)

### Option 2: External Database (Supabase, Neon, Railway)
1. Create a PostgreSQL database on your chosen provider
2. Copy the connection string
3. Add it as `DATABASE_URL` in Vercel environment variables
4. Make sure the connection string includes `?sslmode=require`

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables
In the deployment configuration:
- Add `DATABASE_URL`
- Add `NEXTAUTH_SECRET`
- **Do NOT add `NEXTAUTH_URL`** (Vercel handles this)

### 4. Deploy
Click "Deploy" - Vercel will build and deploy your app

### 5. Run Database Migrations
After first deployment, run migrations:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations on production database
vercel env pull .env.production.local
npx prisma migrate deploy
```

**Alternative**: Use Vercel's terminal in the dashboard:
1. Go to your project → Settings → Functions
2. Use the terminal to run `npx prisma migrate deploy`

## Post-Deployment Checklist

- [ ] Test authentication (register/login)
- [ ] Create a test league
- [ ] Create a test prop
- [ ] Place a test bet
- [ ] Verify database is persisting data
- [ ] Check that redirects work correctly
- [ ] Test on mobile devices

## Troubleshooting

### "Invalid `prisma.xxx.findUnique()` invocation"
- Run `npx prisma generate` locally
- Push changes and redeploy

### "NEXTAUTH_URL environment variable is not set"
- Remove `NEXTAUTH_URL` from Vercel environment variables
- Redeploy

### Database connection errors
- Verify `DATABASE_URL` is correct
- Ensure `?sslmode=require` is in the connection string
- Check database allows connections from Vercel IPs

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

## Important Notes

1. **`.env` file is gitignored** - This is correct! Never commit secrets
2. **Prisma generates client at build time** - Vercel handles this automatically
3. **Use `--legacy-peer-deps`** - Add to Vercel build command if needed:
   - Go to Settings → General → Build & Development Settings
   - Override install command: `npm install --legacy-peer-deps`

## Monitoring

After deployment, monitor:
- Vercel Analytics (free tier available)
- Database connection pool usage
- Function execution times
- Error logs in Vercel dashboard

## Custom Domain (Optional)

1. Go to your project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatic

---

**Need help?** Check Vercel's [Next.js deployment docs](https://vercel.com/docs/frameworks/nextjs)
