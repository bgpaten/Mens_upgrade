# Men's Upgrade OS 🚀

A modern, gamified self-improvement tracking system for men. Track progress across 5 critical life domains, receive automated insights, and maintain accountability through streaks and daily check-ins.

![Men's Upgrade OS](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Features

### 🎯 5 Domains of Growth
- **Physical**: Workout tracking, steps, weight management
- **Appearance**: Grooming habits, outfit ratings
- **Finance**: Income/expense tracking with insights
- **Discipline**: Wake time, deep work, distraction monitoring
- **Emotion**: Mood tracking, trigger identification, no-contact streaks

### 📊 Analytics & Insights
- Real-time score calculation (0-100 per domain)
- 7/30/90-day trend analysis
- Automated rule-based recommendations
- "Hard Truth" statements for accountability
- Tomorrow's mission generation

### 🔥 Gamification
- Streak tracking (No Contact, Workout, Deep Work)
- Progress rings with smooth animations
- Domain-specific scoring algorithms
- Achievement-oriented UI

### 🎨 Modern UI/UX
- Dark mode with glassmorphism design
- Framer Motion animations
- Responsive (desktop + mobile)
- Loading skeletons
- Toast notifications
- Error boundaries

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- TailwindCSS v3
- Framer Motion
- React Router v7
- TanStack Query v5
- React Hook Form + Zod
- Recharts

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- Row Level Security (RLS)
- Postgres Triggers for auto-calculation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Mens_upgrade
npm install
```

### 2. Environment Setup
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings → API.

### 3. Database Setup
1. Go to your Supabase project → SQL Editor
2. Run the entire `supabase_schema.sql` file
3. **IMPORTANT**: Run `supabase_repair.sql` to fix RLS policies:
   ```sql
   -- This ensures all CRUD operations work correctly
   -- Copy and paste the entire supabase_repair.sql content
   ```

### 4. Disable Email Confirmation (Development)
In Supabase Dashboard → Authentication → Providers → Email:
- Uncheck "Confirm email"
- Save

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
Mens_upgrade/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Toast.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── DomainCard.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useProfile.ts
│   │   └── useScores.ts
│   ├── pages/               # Route pages
│   │   ├── Login.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CheckIn.tsx
│   │   └── Analytics.tsx
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── App.tsx              # Router + Auth Provider
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── supabase_schema.sql      # Database schema
├── supabase_repair.sql      # RLS policy fixes
└── package.json
```

## 🔐 Authentication Flow

1. **Signup/Login** → Email/password via Supabase Auth
2. **Onboarding** → 2-step profile setup
3. **Dashboard** → Main app (protected route)

## 📊 How Scoring Works

Scores are calculated automatically via Postgres triggers when you submit a daily log:

### Physical (0-100)
- Workout done: +60
- Steps: up to +30 (8000 steps = full points)

### Appearance (0-100)
- Grooming done: +60
- Outfit rating: 1-5 scale × 8 = up to +40

### Finance (0-100)
- Income logged: +20
- Low expenses: +40
- Base: +40

### Discipline (0-100)
- Wake on time: +30
- Deep work: up to +50 (240 min = full points)
- Distraction penalty: up to -30

### Emotion (0-100)
- Mood: 1-5 scale × 10 = up to +50
- Stalking ex: -40 penalty
- Trigger logged: +10

**Total Score** = Average of all 5 domains

## 🐛 Troubleshooting

### Error 403/406 on Supabase Queries
**Solution**: Run `supabase_repair.sql` in SQL Editor. This fixes RLS policies.

### "Connection Refused" Error
**Cause**: ISP might be blocking Supabase domain.
**Solution**: Use VPN or mobile hotspot.

### Infinite Loading Loop
**Solution**: Clear browser cache and reload. Ensure `.env` file exists with correct credentials.

### Recharts Warning
**Normal**: Happens during initial load. Ignore if charts render correctly.

## 🎨 Customization

### Change Color Scheme
Edit `src/index.css`:
```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Modify Scoring Algorithm
Edit `supabase_schema.sql` → `calculate_scores_and_recommendations()` function.

### Add New Domain
1. Update `supabase_schema.sql` (add column to `domain_scores`)
2. Update trigger function
3. Add UI in `Dashboard.tsx` and `CheckIn.tsx`

## 📦 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- Design inspiration: Modern SaaS dashboards
- Icons: Lucide React
- Charts: Recharts
- Backend: Supabase

---

**Built with discipline. Maintained with consistency. Designed for champions.**

For issues or questions, open a GitHub issue or contact the maintainer.
