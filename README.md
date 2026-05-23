# AI Project Tracker

A full-stack, real-time collaborative project management tool that transforms documents into structured requirements using AI.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Firebase** (Auth, Firestore, Storage)
- **OpenAI GPT-4o mini** — strict requirement extraction
- **Tailwind CSS** — custom design system
- **Libraries**: `pdf-parse`, `mammoth`, `react-hot-toast`, `date-fns`, `jspdf`, `react-dropzone`, `next-themes`

## Features

- 🤖 **AI Extraction** — paste text or upload PDF/DOCX/TXT → AI extracts only explicit requirements with confidence scores
- 🔄 **Real-Time Sync** — Firestore `onSnapshot` listeners sync changes instantly across all team members
- 🎨 **Colour-Coded Accountability** — every edit is stamped with the editor's colour
- 👥 **Role-Based Access** — Full Editing vs Checkbox Only modes, enforced in Firestore rules
- 📋 **Activity Log** — live feed of all changes with timestamps
- 🕐 **Version History** — revert any requirement to a previous version
- 🏷️ **Tags & Filters** — custom project tags with colour coding
- 📅 **Due Dates** — per-requirement deadlines with overdue highlighting
- 📤 **Export** — PDF, CSV, Markdown one-click export
- 🌙 **Dark Mode** — smooth theme toggle, persisted in localStorage
- 🎭 **Demo Mode** — try without signing up at `/demo`
- 📱 **Responsive** — works on mobile down to 320px

## Setup

### 1. Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (start in test mode, then apply the rules)
4. Enable **Authentication** → add providers: **Email/Password**, **Google**, **Anonymous**
5. Enable **Storage**
6. Go to **Project Settings** → **Your apps** → Add a **Web app** → copy the config

### 2. Firebase Admin SDK Key

1. In Firebase Console → **Project Settings** → **Service Accounts**
2. Click **Generate new private key** → download JSON
3. Copy `client_email` and `private_key` values

### 3. OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key

### 4. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

OPENAI_API_KEY=sk-...
```

> ⚠️ The `FIREBASE_ADMIN_PRIVATE_KEY` must be wrapped in double quotes and have literal `\n` for newlines.

### 5. Firestore Security Rules

In Firebase Console → Firestore → **Rules**, paste the contents of `firestore.rules`.

### 6. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
app/
├── app/
│   ├── api/
│   │   ├── analyze/         # AI extraction endpoint
│   │   ├── projects/        # Project CRUD + invite + settings
│   │   └── users/           # User colour update
│   ├── dashboard/           # Main project list
│   ├── demo/                # Guest/demo mode
│   ├── login/               # Auth pages
│   ├── register/
│   ├── profile/             # User colour picker
│   ├── projects/
│   │   ├── new/             # AI extract + manual create
│   │   └── [id]/            # Project detail (real-time)
│   ├── layout.tsx
│   ├── page.tsx             # Landing page
│   └── globals.css
├── components/
│   ├── activity/            # ActivityFeed (real-time)
│   ├── export/              # ExportMenu (PDF/CSV/MD)
│   ├── projects/            # ProjectCard
│   ├── requirements/        # RequirementRow, AddForm, VersionHistory
│   ├── navbar.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── firebase.ts          # Client SDK
│   ├── firebase-admin.ts    # Admin SDK
│   ├── auth-context.tsx     # Auth provider
│   └── firestore.ts         # Data access layer
├── types/
│   └── index.ts             # TypeScript interfaces
└── firestore.rules          # Security rules
```
