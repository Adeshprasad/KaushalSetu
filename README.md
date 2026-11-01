# KaushalSetu Portal

**Regional-language skill and job matching platform designed for rural youth in India.**

🔗 **Live demo:** [kaushalsetu-2q3o.onrender.com](https://kaushalsetu-2q3o.onrender.com)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini-API-4285F4?logo=google&logoColor=white)

---

## About

KaushalSetu ("Skill Bridge") connects young people in rural India with vocational jobs, government skill schemes and nearby training centres, in their own language. Users describe what they can do in plain words (Hindi, Hinglish, English and more). The app turns that into a structured skill profile and matches it to real opportunities.

## The Problem

Many rural youth have practical skills such as welding, tailoring, wiring or motorcycle repair, but job portals and government scheme pages are mostly in English, full of jargon, and hard to navigate. KaushalSetu removes that barrier with simple language, transparent matching and grounded AI explanations.

## Features

- **AI skill extraction.** Describe your work in free text (for example "bike ka mistri, thoda bijli ka kaam"). Gemini maps it to a canonical skill taxonomy, with a local dictionary fallback when the API is unavailable.
- **Job matching with explanations.** A deterministic match score, matched and missing skills, and a short, plain-language reason for each match.
- **Multi-language support.** Hindi, English, Bengali, Tamil and Odia for AI-generated explanations.
- **Government scheme simplifier.** Turns official scheme data into "who is eligible, what you get, how to apply, documents needed" in simple words.
- **Scheme Q&A chatbot.** Answers questions grounded only in the official data of the selected scheme, and says so when the information isn't available.
- **Third-party job ingestion.** Pulls vocational listings from National Career Service (NCS), Apprenticeship India and other external sources, with optional live search grounding.
- **Nearby training centres.** Finds ITIs, PMKVY Kaushal Kendras, CSC Digital Seva points and employment exchanges using Google Maps grounding, with a local fallback.
- **Job applications.** Candidates apply and applications are tracked by status (submitted, under review, shortlisted, interview scheduled).
- **Employer job posting.** Create, update and delete job listings.
- **Admin metrics.** Totals for users, jobs, schemes and applications, plus top skills and a state-wise breakdown.
- **Google sign-in** with Firebase Authentication.
- **Resilient AI layer.** 15-minute response caching, automatic model fallback and graceful degradation when rate limits are hit.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion, Lucide React |
| Backend | Node.js, Express 4 |
| AI | Google Gemini via `@google/genai` (Gemini 2.5 Flash with fallbacks) |
| Auth and database | Firebase Authentication, Cloud Firestore |
| Tooling | tsx, esbuild, dotenv |
| Hosting | Vercel (frontend) |

## Data Model (Firestore)

Defined in [`firebase-blueprint.json`](firebase-blueprint.json), with security rules in [`firestore.rules`](firestore.rules).

| Collection | Purpose |
|---|---|
| `users/{userId}` | Profiles: language, location, skills, experience, saved and applied jobs, role (candidate, employer, admin) |
| `jobs/{jobId}` | Verified vocational and technical jobs |
| `schemes/{schemeId}` | Government welfare and skill development schemes |
| `applications/{applicationId}` | Job applications submitted by candidates |

## API Routes

The Express server in `server.ts` exposes:

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/skills/extract` | Extract canonical skills from free text |
| POST | `/api/jobs/explain-match` | Plain-language explanation of a job match |
| POST | `/api/jobs/external-fetch` | Fetch NCS, Apprenticeship and live-grounded jobs |
| POST | `/api/schemes/explain-simple` | Simplify a government scheme |
| POST | `/api/schemes/chat` | Grounded scheme Q&A |
| GET, POST, PATCH, DELETE | `/api/data/jobs` | Job listings CRUD |
| GET | `/api/data/schemes` | List schemes |
| POST, GET | `/api/data/apply`, `/api/data/applications` | Submit and list applications |
| GET | `/api/admin/metrics` | Admin statistics |
| POST | `/api/maps/search`, `/api/maps/nearby-centers` | Nearby training centres |

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- A Firebase project with **Google sign-in** and **Firestore** enabled

### Installation

```bash
git clone https://github.com/Adeshprasad/KaushalSetu.git
cd KaushalSetu
npm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_DATABASE_ID=your_firestore_database_id
```

> Never commit `.env.local`. It is already listed in `.gitignore`.

### Run locally

```bash
npm run dev
```

The app and API run together on [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

This builds the Vite frontend and bundles `server.ts` to `dist/server.cjs`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Express and Vite dev server |
| `npm run build` | Build the frontend and bundle the server |
| `npm start` | Run the production server |
| `npm run preview` | Preview the Vite build |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Project Structure

```
KaushalSetu/
├── public/                  # Static assets
├── src/
│   ├── data/                # Seed jobs, schemes, skill taxonomy, external jobs
│   ├── lib/firebase.ts      # Firebase initialisation
│   └── types.ts             # Shared TypeScript types
├── server.ts                # Express API and Gemini integration
├── firebase-blueprint.json  # Firestore entity definitions
├── firestore.rules          # Firestore security rules
├── vite.config.ts
└── package.json
```

## Deployment Notes

- The frontend is deployed on Vercel. Set every variable from the list above in **Project Settings → Environment Variables**.
- `server.ts` is a long-running Express server. Vercel only hosts the static frontend by default, so the `/api/*` routes need a Node host (for example Render, Railway or Cloud Run) or must be converted to Vercel serverless functions.
- Restrict your Firebase API key to your domains in Google Cloud and add the deployed domain to Firebase **Authentication → Authorized domains**.

## Known Limitations

- Jobs and applications served by `server.ts` are kept in memory and reset when the server restarts. Persisting them to Firestore is the next step.
- Government scheme data is seeded sample data. Always verify details on the official portal before applying.

## Roadmap

- [ ] Persist jobs and applications to Firestore
- [ ] Voice input for low-literacy users
- [ ] More regional languages
- [ ] Employer dashboard with candidate shortlisting
- [ ] SMS and WhatsApp job alerts

## Contributing

Contributions are welcome. Open an issue to discuss what you'd like to change, then submit a pull request.

## License

Add a `LICENSE` file (MIT is a common choice) and update this section.

---

*Built to help rural youth in India find work that fits their skills.*
