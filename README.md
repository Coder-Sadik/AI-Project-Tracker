# AI Project Tracker 🚀

A premium, full-stack, real-time collaborative project management tool that magically transforms unstructured documents into structured project requirements using Google Gemini 2.5 Flash.

Designed with a custom **"Luxe Minimalist"** aesthetic, this application focuses on fluid micro-animations, glassmorphism, and a highly polished user experience.

---

## ✨ Core Features

### 🤖 Instant AI Extraction
Stop writing project tickets manually. Simply paste your brief, or upload a PDF/DOCX file. Our integration with **Google Gemini 2.5 Flash** instantly scans the document and extracts *only* the explicitly stated requirements, turning paragraphs into structured, actionable tasks.

### ⚡ Real-Time Collaboration
No refresh required. Built on Firebase Firestore with `onSnapshot` listeners, every edit, new requirement, or checkbox toggle syncs instantly across all connected team members. 

### 🎨 Colour-Coded Accountability
Full transparency in multiplayer mode. Every team member is assigned a unique colour upon joining. Every change or edit to a requirement is permanently stamped with the editor's colour and name.

### 🎭 Interactive & Premium UI
- **Live AI Demo Widget:** Test the AI extraction right on the landing page.
- **Animated Auto-Stepper:** A beautiful, auto-advancing "How it Works" section with dynamic CSS animations (typing text, scanning bars, flying cursors).
- **Luxe Minimalist Design:** DM Sans typography, soft glassmorphism panels, and carefully crafted easing curves for hover states and transitions.
- **Smooth Dark Mode:** Natively built to swap between a crisp light mode and a deep, luxurious dark mode.

### 🛡️ Role-Based Access Control
Project owners have ultimate control. Grant teammates full editing permissions, or restrict them to a "Checkbox Only" mode to prevent unauthorized scope creep.

### 🕒 Deep Activity & Version History
- **Activity Log:** A live, scrolling feed of all changes made to the project with exact timestamps.
- **Time Travel:** Accidentally deleted a requirement? View the full version history of any task and revert it back to a previous state with one click.

### 📤 Export Anywhere
When the project plan is finalized, export it in one click to:
- **PDF** for client sign-off
- **CSV** for Excel/Google Sheets tracking
- **Markdown** for GitHub/Jira importing

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server/Client Components)
- **Language:** TypeScript
- **Database & Auth:** Firebase (Firestore, Auth, Storage, Security Rules)
- **AI Model:** Google Gemini 2.5 Flash (`@google/genai`)
- **Styling:** Tailwind CSS (Custom design system)
- **Utilities:** `pdf-parse`, `mammoth`, `date-fns`, `jspdf`, `next-themes`

---

## 📂 Project Architecture

```
app/
├── app/
│   ├── api/                 # AI extraction & backend endpoints
│   ├── dashboard/           # Main user dashboard
│   ├── projects/[id]/       # Real-time multiplayer project view
│   ├── login/ & register/   # Authentication flows
│   └── page.tsx             # Interactive landing page
├── components/
│   ├── live-demo-widget.tsx # AI simulation UI
│   ├── animated-how-it-works.tsx # Interactive stepper UI
│   ├── activity/            # Live activity feed
│   └── requirements/        # Task management & version history
├── lib/                     # Firebase clients & Admin SDK
└── firestore.rules          # Strict security policies
```

*Built to turn ideas into action, instantly.*
