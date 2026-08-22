<div align="center">

# 🎙️ Resona — AI Voice Synthesis & Voice Cloning Studio

An ultra-modern, full-stack AI voice generator and instant voice cloning SaaS platform built with **Next.js 16**, **High-Definition Neural TTS Engine**, **Supabase Storage & PostgreSQL**, and **Clerk Authentication**.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Neural TTS](https://img.shields.io/badge/AI_Voice-Neural_Engine-brightgreen)](https://github.com/gayatrii-ii/resona-ai-voice-saas)
[![Supabase](https://img.shields.io/badge/Supabase-Storage_%26_DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features

- **🎙️ High-Fidelity Text-to-Speech**: Instant speech synthesis powered by high-definition neural voice models.
- **🧬 1-Click Voice Cloning**: Clone custom voices in seconds from audio file uploads (`.wav`, `.mp3`, `.m4a`) or live microphone recordings.
- **🗂️ 20+ Studio Voices**: Pre-loaded catalog of built-in voices across conversational, audiobook, narrative, corporate, and character styles.
- **🌊 Interactive WaveSurfer Audio Player**: High-definition interactive audio waveform scrubber with play, pause, download, and copy-link options.
- **🪟 Hover-to-Slide Dock Sidebar**: Collapsible floating dock sidebar that expands smoothly on hover with floating elevation.
- **🎨 Obsidian Dark & Slate Light Theme**: Modern typography, glassmorphism borders, and snappy transition effects.
- **🔐 Multi-Tenant Workspace & Auth**: Managed by Clerk with organization switching, role-based access, and personal workspace fallbacks.
- **⚡ 100% Free & Unlimited**: Zero subscriptions, zero paywalls, zero GPU tokens required.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([User Browser]) -->|1. Request Synthesis| NextApp[Next.js 16 Web Studio]
    NextApp -->|2. tRPC Query / Mutation| TRPC[tRPC API Layer]
    TRPC -->|3. Check Auth & Workspace| Clerk[Clerk Auth / Org]
    TRPC -->|4. Synthesize HD Speech| NeuralEngine[HD Neural Voice Engine]
    NeuralEngine -->|5. Return Audio WAV Stream| NextApp
    NextApp -->|6. Save Audio & Metadata| SupabaseDB[(Supabase PostgreSQL & Storage)]
    NextApp -->|7. Stream Audio to WaveSurfer| User
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (Turbopack, App Router, RSC)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Backend & API** | [tRPC v11](https://trpc.io/) + [TanStack React Query v5](https://tanstack.com/query) |
| **AI / TTS Engine** | High-Definition Neural TTS Engine (Direct Streaming) |
| **Database & ORM** | [Supabase PostgreSQL](https://supabase.com/) + [Prisma ORM](https://www.prisma.io/) |
| **Audio File Storage** | [Supabase Storage](https://supabase.com/storage) (REST API Bucket) |
| **Authentication** | [Clerk](https://clerk.com/) (Organizations, Multi-tenancy, User Profiles) |
| **Styling & Components** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/) |
| **Audio Visualizer** | [WaveSurfer.js](https://wavesurfer.xyz/) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- Accounts with **Supabase** and **Clerk**.

---

### 2. Clone Repository & Install Dependencies

```bash
git clone https://github.com/gayatrii-ii/resona-ai-voice-saas.git
cd resona-ai-voice-saas
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase Database & Storage
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=resona-audio

# App URL
APP_URL=http://localhost:3000
```

---

### 4. Database Setup & Seed Voices

```bash
# Push Prisma schema to Supabase PostgreSQL
npx prisma db push

# Seed 20 system voice profiles and audio assets
npx tsx scripts/seed-system-voices.ts
```

---

### 5. Run the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📖 Key Project Structure

```text
resona/
├── prisma/
│   └── schema.prisma             # Prisma Database schema (Voice, Generation, User)
├── scripts/
│   └── seed-system-voices.ts     # System voice catalog seeding script
├── src/
│   ├── app/                      # Next.js 16 App Router (RSC, layouts, pages)
│   ├── components/               # Radix UI, WaveSurfer player, Sidebar dock
│   ├── features/
│   │   ├── dashboard/            # Studio dashboard & quick actions
│   │   ├── text-to-speech/       # TTS workspace, sliders & waveform detail
│   │   └── voices/               # Explore voices library & voice cloning modal
│   ├── lib/
│   │   ├── db.ts                 # Prisma client instance
│   │   ├── r2.ts                 # Supabase Storage client & signed URL helpers
│   │   └── env.ts                # T3-validated environment schema
│   └── trpc/                     # Type-safe tRPC routers & React Query client
```

---

## 👤 Author & Contributor

Developed and maintained by **[Gayatri Kadam](https://github.com/gayatrii-ii)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
