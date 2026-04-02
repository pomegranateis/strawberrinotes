# Strawberries & Notes

A soft, aesthetic note-taking and productivity app inspired by Notion — wrapped in the prettiest pink palette you've ever seen.

**Built with:** Next.js 14 · Tailwind CSS · Clerk · Supabase · Tiptap

---

## ✦ Features

| Feature | Details |
|---|---|
| Rich note editor | Tiptap with headings, bold, italic, underline, lists, code blocks, task lists, images, links |
| Public sharing | Toggle any note public → shareable link, no login required to view |
| To-do list | Priority levels, due dates, categories, progress bar |
| Timetable | Weekly grid, add/remove classes with colours and rooms |
| Auth | Clerk — supports email, Google, GitHub |
| Auto-save | Saves 1.5s after you stop typing |
| Aesthetic | Baby pink, cream, lace — cottagecore meets productivity |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/you/strawberries-and-notes.git
cd strawberries-and-notes
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | Same place |
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same place |
| `SUPABASE_SERVICE_ROLE_KEY` | Same place (service_role key) |

### 3. Set up Supabase

In your Supabase project, go to **SQL Editor** and run the contents of:

```
lib/schema.sql
```

This creates the `notes`, `todos`, `timetable_entries`, and `profiles` tables with Row Level Security.

### 4. Configure Clerk redirect URLs

In your Clerk dashboard → Redirects, set:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✦

---

## Folder Structure

```
strawberries-and-notes/
├── app/
│   ├── page.tsx                  ← Landing page
│   ├── layout.tsx                ← Root layout (Clerk + toast)
│   ├── globals.css               ← Global styles + Tiptap prose
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── DashboardClient.tsx
│   ├── notes/
│   │   ├── page.tsx              ← Notes grid + search
│   │   ├── NotesClient.tsx
│   │   ├── new/page.tsx          ← New note editor
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── NoteEditorClient.tsx
│   ├── share/[id]/page.tsx       ← Public read-only note view
│   ├── todo/
│   │   ├── page.tsx
│   │   └── TodoClient.tsx
│   ├── timetable/
│   │   ├── page.tsx
│   │   └── TimetableClient.tsx
│   ├── auth/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   └── api/
│       ├── notes/route.ts        ← GET list, POST create
│       ├── notes/[id]/route.ts   ← GET, PATCH, DELETE
│       ├── todos/route.ts
│       └── timetable/route.ts
├── components/
│   └── layout/
│       ├── AppLayout.tsx         ← Auth-gated shell
│       ├── Sidebar.tsx           ← Collapsible sidebar
│       └── Topbar.tsx            ← Search + breadcrumb
├── lib/
│   ├── supabase.ts               ← Supabase clients
│   ├── utils.ts                  ← cn(), formatDate(), colours
│   └── schema.sql                ← Copy-paste into Supabase
├── types/index.ts
├── middleware.ts                 ← Clerk route protection
└── .env.local.example
```

---

## Routes

| Route | Description | Auth required |
|---|---|---|
| `/` | Landing page | No |
| `/dashboard` | Home dashboard | Yes |
| `/notes` | Notes grid | Yes |
| `/notes/new` | New note editor | Yes |
| `/notes/[id]` | Edit note | Yes |
| `/share/[id]` | Public note view | No |
| `/todo` | To-do list | Yes |
| `/timetable` | Weekly timetable | Yes |

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

Update `NEXT_PUBLIC_APP_URL` to your production URL.

---

## Design Reference

The aesthetic is inspired by:
- Soft pink leopard print textures
- Cottagecore patchwork florals
- Botanical illustration prints
- Kawaii strawberry ribbons
- Lace-trimmed lily photography
- Classic polka dot patterns

Fonts: **Playfair Display** (serif headings) + **DM Sans** (body)

---

# strawberries-notes
