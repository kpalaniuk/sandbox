# Sandbox - Shared Trip Container

A mobile-first web app that automatically aggregates and organizes multimedia, messages, itineraries, and expenses during shared experiences.

**Built overnight by Jasper 🤖 (March 5, 2026)**

## 🎯 MVP Features (Implemented)

✅ **Authentication** - Clerk integration with email/OAuth sign-in  
✅ **Sandbox Creation** - Create time-bound trip containers with privacy settings  
✅ **Timeline View** - Chronological feed of photos, messages, and expenses  
✅ **Media Upload** - Upload photos/videos with captions  
✅ **Responsive Design** - Mobile-first UI with Granada House design system  
✅ **Database Schema** - Full Supabase schema with RLS policies  

## 🚧 Features In Progress

- [ ] Real-time chat with threaded comments
- [ ] Expense splitting with settle-up links
- [ ] Participant management (invite/roles)
- [ ] Itinerary builder
- [ ] Auto-upload SDK (requires native apps)
- [ ] ML highlights & trip summaries
- [ ] E-commerce integration (photo books, merch)

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for production)
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kpalaniuk/sandbox.git
cd sandbox
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
- Clerk keys from [clerk.com](https://clerk.com)
- Supabase keys from [supabase.com](https://supabase.com)

4. Set up the database:
   - Go to your Supabase project SQL editor
   - Run the schema from `supabase-schema.sql`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

The app uses 7 main tables:

- **sandboxes** - Trip containers with metadata
- **participants** - User roles and permissions per sandbox
- **media_items** - Photos, videos, audio uploads
- **events** - Itinerary items with time/location
- **expenses** - Bill splitting with status tracking
- **messages** - Chat and comments
- **reactions** - Emoji reactions on media

See `supabase-schema.sql` for full schema with indexes and RLS policies.

## 🎨 Design System

Based on Granada House:
- `midnight` (#0a0a0a) - Dark text/backgrounds
- `sand` (#f8f7f4) - Light backgrounds
- `ocean` (#0066FF) - Primary actions/links
- `terracotta` (#FFB366) - Warm accent
- `sunset` (#FFBA00) - Highlights
- `cyan` (#22E8E8) - Secondary accent

Fonts:
- Display: Space Grotesk
- Body: Inter

## 📱 Mobile PWA

The app is designed as a Progressive Web App:
- Add to home screen support
- Offline-first architecture (ready for service worker)
- Touch-optimized UI with 44px tap targets
- Safe area insets for notched displays

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub:
```bash
git remote add origin https://github.com/kpalaniuk/sandbox.git
git push -u origin main
```

2. Import to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Add environment variables from `.env.local`
   - Deploy

3. Set up Supabase connection:
   - Ensure RLS policies are enabled
   - Add Vercel domain to Supabase allowed origins

### Manual Deployment

```bash
npm run build
npm start
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Clerk authentication with session management
- Privacy settings: private, link-only, or public sandboxes
- User-controlled data deletion

## 📊 Database Access

Supabase connection:
```typescript
import { supabase } from '@/lib/supabase'

// Client-side (respects RLS)
const { data } = await supabase
  .from('sandboxes')
  .select('*')
  
// Server-side (admin, use sparingly)
import { supabaseAdmin } from '@/lib/supabase'
```

## 🤝 Contributing

This is an overnight MVP. Pull requests welcome for:
- Real-time chat implementation
- Expense splitting logic
- Photo upload to Supabase Storage
- PWA service worker
- Testing (unit, integration, E2E)

## 📝 Development Notes

### What's Working
- Auth flow (sign-up, sign-in, sign-out)
- Create/view sandboxes
- Upload media with captions
- Timeline view with mixed content types
- Mobile-responsive navigation

### Known Limitations (MVP)
- **Upload**: Files are not persisted to storage (placeholder URLs)
- **Chat**: No real-time updates (requires WebSocket/Supabase Realtime)
- **Expenses**: UI stub only (no calculation logic)
- **Participants**: No invite system yet
- **Search**: Not implemented
- **Notifications**: Not implemented

### Next Steps for Production
1. Implement Supabase Storage for media uploads
2. Add Supabase Realtime for chat
3. Build expense splitting calculator
4. Create invite/share flow
5. Add email notifications
6. Implement ML highlights (OpenAI/Anthropic)
7. E-commerce integration (Printful/Shutterfly)

## 📄 License

MIT

## 🙏 Acknowledgments

- Built by [Jasper](https://openclaw.ai) (AI assistant)
- Design system from [Granada House](https://granadahouse.com)
- Spec provided by Kyle Palaniuk

---

**Status**: MVP Complete ✅  
**Deploy Ready**: Yes  
**Production Ready**: Not yet - see Known Limitations  

For questions or issues, open a GitHub issue or contact kyle@palaniuk.net
