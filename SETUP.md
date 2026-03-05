# Sandbox - Setup Guide

## 🎯 Quick Start (5 minutes)

### 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Use your existing Granada House project: `apceaxfvgnqsscdilxqd`
3. Go to **SQL Editor**
4. Create a new query
5. Paste the contents of `supabase-schema.sql`
6. Run the query
7. Verify tables created in **Table Editor**

### 2. Verify Environment Variables

The `.env.local` file is already configured with your Clerk and Supabase keys.

**Double-check these values**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=eyJ2...
CLERK_SECRET_KEY=eyJ2...
NEXT_PUBLIC_SUPABASE_URL=https://apceaxfvgnqsscdilxqd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Install & Run

```bash
cd /data/projects/sandbox
npm install
npm run dev
```

Open http://localhost:3000

### 4. Test It

1. Click "Sign In" (or "Get Started")
2. Sign in with your Clerk account
3. Click "Create Sandbox"
4. Fill out the form:
   - Title: "Test Trip"
   - Description: "Testing the app"
   - Start Date: Tomorrow
   - Privacy: Private
5. Click "Create Sandbox"
6. You should see the timeline view
7. Click "Upload" in bottom nav
8. Upload a photo with a caption
9. Submit
10. See it appear in the timeline

---

## 🚀 Deploy to Vercel

### Step 1: Create GitHub Repo

```bash
# On your local machine or in GitHub UI
# Create new repo: kpalaniuk/sandbox
```

### Step 2: Push Code

```bash
cd /data/projects/sandbox
git branch -M main
git remote add origin git@github.com:kpalaniuk/sandbox.git
git push -u origin main
```

### Step 3: Deploy

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `kpalaniuk/sandbox`
4. Configure environment variables (copy from `.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

5. Click "Deploy"
6. Wait ~2 minutes
7. Click the deployment URL

### Step 4: Configure Clerk

1. Go to [clerk.com/dashboard](https://clerk.com/dashboard)
2. Select your application
3. Go to **Domains**
4. Add your Vercel domain (e.g., `sandbox-xyz.vercel.app`)
5. Save

### Step 5: Configure Supabase

1. Go to your Supabase project
2. Go to **Authentication** → **URL Configuration**
3. Add your Vercel domain to **Site URL** and **Redirect URLs**
4. Save

---

## 🔧 Troubleshooting

### "Unauthorized" error when creating sandbox

**Cause**: Supabase schema not applied  
**Fix**: Run `supabase-schema.sql` in SQL Editor

### Clerk redirect loop

**Cause**: Domain not configured  
**Fix**: Add Vercel domain to Clerk dashboard

### Photos not appearing

**Cause**: RLS policies not enabled  
**Fix**: Check that RLS is enabled on all tables (should be by default from schema)

### Build fails on Vercel

**Cause**: Missing environment variables  
**Fix**: Double-check all env vars are set in Vercel project settings

---

## 📱 Mobile Testing

### iOS (Safari)

1. Open the deployed URL on iPhone
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon appears on your home screen
6. Tap to open - runs like a native app!

### Android (Chrome)

1. Open the deployed URL on Android
2. Tap the menu (⋮)
3. Tap "Add to Home Screen"
4. Tap "Add"
5. The app icon appears on your home screen

---

## 🎨 Customization

### Change Colors

Edit `app/globals.css`:

```css
@theme {
  --color-ocean: #0066FF;  /* Change primary color */
  --color-terracotta: #FFB366;  /* Change accent */
}
```

### Change Fonts

Edit `app/layout.tsx`:

```typescript
import { YourFont } from "next/font/google";

const yourFont = YourFont({
  subsets: ["latin"],
  variable: "--font-display",
});
```

---

## 📊 Database Queries

### Get all sandboxes for a user

```sql
SELECT s.*
FROM sandboxes s
JOIN participants p ON p.sandbox_id = s.id
WHERE p.user_id = 'user_abc123';
```

### Get timeline for a sandbox

```sql
SELECT * FROM media_items WHERE sandbox_id = 'sandbox_xyz' ORDER BY timestamp DESC;
SELECT * FROM messages WHERE sandbox_id = 'sandbox_xyz' ORDER BY created_at DESC;
SELECT * FROM expenses WHERE sandbox_id = 'sandbox_xyz' ORDER BY created_at DESC;
```

---

## 🚨 Security Checklist

- [x] RLS enabled on all tables
- [x] Clerk authentication required
- [x] Service role key only used server-side
- [x] No sensitive data in client code
- [x] Privacy settings respected
- [ ] Rate limiting (add in production)
- [ ] Input validation (add in production)
- [ ] CORS configuration (add in production)

---

## 🎓 Learning Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Need help?** Check the README.md or ping me in Discord.

— Jasper 🤖
