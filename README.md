# StudyPulse — Social Focus, Pixel RPG & University Active Learning Studio

StudyPulse is a full-stack, mobile-first & desktop-responsive social focus timer, ambient audio studio, Floating PiP companion, analytics suite, active learning vault, and persistent pixel-art dungeon crawler (*Chronicles of Oakhaven*) built to bridge deep-work discipline with authentic Politecnico di Torino coursework.

Live production URL: **https://study.matinz03.tech**  
University Knowledge Portal (`matinz03/University`): **https://university.matinz03.tech**

---

## 1. Tech Stack & Repository Layout

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4 (`src/index.css`), Framer Motion, Lucide Icons, HTML5 Canvas pixel-art renderer (`src/game/pixelSprites.ts`), Web Audio procedural synthesizer (`src/utils/soundEngine.ts`), Floating Document + Video PiP engine (`src/utils/pipEngine.ts`), Service Worker + Web Push (`public/sw.js`).
- **Backend:** Node.js + Express (`server/index.js`), WebSocket live presence & room sync (`ws`), SQLite via `better-sqlite3` (`server/db.js` WAL mode + foreign keys + safe idempotent migrations), Web Push VAPID notifications (`web-push`), Procedural Pixel RPG (`server/gameEngine.js`, `server/dungeonGenerator.js`, `server/storyData.js`), 4-tier Rotating Coin Store (`server/shopEngine.js`), University Vault Curriculum Seed (`server/universityData.js`).
- **Themes:** 16 Dark/Light themes (`src/themes.ts`) synchronized across main UI, Service/PWA chrome, and Floating PiP HUD (`shadcn-dark/light`, `vercel/vercel-light`, `linear/linear-light`, `apple-glass/apple-light`, `raycast/raycast-light`, `sage-dark/light`, `indigo-dark/light`, `terracotta-dark/light`).

---

## 2. `University` Repository Integration Architecture

Sourced directly from `C:\Users\Damian Zod\Documents\University` (`matinz03/University` Obsidian vault + Quartz portal `https://university.matinz03.tech`):

| Vault Source | Content Integrated into StudyPulse | StudyPulse Module |
| :--- | :--- | :--- |
| `10 Courses/*.md` & `Connected Reading Guide.md` | 4 core courses, exam targets, & sequential concept reading trails (*RISC-V -> Pipelining -> Dynamic Scheduling -> Speculation*, *DW -> KDD -> Apriori -> Clustering*, *Virtualization -> Cgroups -> Docker -> Cloud/Edge*, *IPv4 -> Cellular -> IPv6 -> OSPF -> BGP*). | `server/universityData.js`, `FocusView.tsx` |
| `20 Concepts/*` (181 atomic concept notes) & `00 Inbox/* - Learning Progress` | 32 FSRS spaced-repetition flashcards + 4-choice quiz cards covering hazards, Tomasulo, ROB, cache policies, ROLAP/MOLAP/HOLAP, Apriori/FP-growth, Silhouette/DBSCAN, VT-x/EPT, namespaces/cgroups, CIDR, GSM/LTE/5G, and OSPF/BGP; plus recall prompts seeded into study notes. | `server/universityData.js`, `flashcards` & `study_notes` tables, `POST /api/university/review`, `POST /api/game/study-cast` |
| `10 Courses/Internet Architecture.../Exercises/` | Interactive **IPv4 CIDR & Host-Sizing Step-by-Step Calculator** preserving the `hosts + 2 -> power of two -> host bits h -> /prefix (32-h) -> binary/decimal netmask -> usable range` workflow + `/31` point-to-point clarification. | `FocusView.tsx` -> Lab Tools Tab |
| `50 Labs/Computer Architectures/Lab 01 & 02` | Interactive **CPU Pipeline CPI, Weighted Execution Time ($T_i = \text{cycles}_i / 1750\text{ Hz}$) & Amdahl's Law ($S = 1 / ((1 - p) + p/s)$) Calculator** matching the ASE Studio / gem5 lab workflows. | `FocusView.tsx` -> Lab Tools Tab |
| `00 Inbox/* - Learning Progress` Markdown convention | Built-in **Obsidian Session Scratchpad & Learning Progress Composer** with 1-click download of frontmatter-tagged `.md` files (`type: learning-progress`, recall prompts, source links) ready to drop directly into `00 Inbox/`. | `FocusView.tsx` -> Notes & Exams Tab |

---

## 3. StudyPulse v3.0 — 6-Pillar Implementation Roadmap & Handoff Status

> **Agent Handoff Convention:** Keep checkboxes below updated immediately after each milestone is implemented and verified (`npx tsc --noEmit && npm run build` + Playwright E2E).

### Phase 1: Living Architecture & Handoff Documentation
- [x] Research competitor landscape (*Yeolpumta*, *Spirit City*, *Habitica*, *Forest*, *Focus Tree*, *Flocus*, *StudyNook*) and audit `C:\Users\Damian Zod\Documents\University`
- [x] Architect full 6-Pillar roadmap and document integration map in `README.md`

### Phase 2: University Curriculum Data & SQLite Schema Migrations
- [x] **Pillar 4 / University Seed:** Create `server/universityData.js` (`UNIVERSITY_PORTAL_URL`, `UNIVERSITY_COURSES`, `UNIVERSITY_FLASHCARDS`)
- [x] **Database Migrations:** Update `server/db.js` with `flashcards`, `exam_goals`, `study_notes`, `room_raids`, `room_messages`, `focus_duels`, plus `specialization` on `game_profiles`, and export `ensureUniversitySeed(userId)`

### Phase 3: Backend Engines & REST/WebSocket Endpoints
- [x] **Pillar 1 (Co-Op & RPG Mastery):** Update `server/gameEngine.js` with `HERO_SPECIALIZATIONS` (2 masteries per hero class), `selectSpecialization()`, `companionEvolution` stage computation, and `resolveStudyCast()` (FSRS flashcard quiz -> critical RPG strike / riddle solve)
- [x] **Pillars 1, 2, 4, 5, 6 (Server APIs):** Update `server/index.js`:
  - [x] Enrich `buildRoomOccupants()` with hero sprite metadata, `raid` (Weekly Room Raid Boss), `syncTimer` (deterministic 25m/5m shared Pomodoro phase), and recent `messages` (Room Lounge Chat)
  - [x] Extend `POST /api/sessions` with `wagerCoins` (high-stakes focus contracts) and automatic Co-Op Room Raid Boss damage
  - [x] Expand `buildBootstrap()` with `heatmap365`, `prevWeekMins`, `todayTimeline`, `university`, `league`, and `activeDuel`
  - [x] Implement `/api/university/*`, `/api/game/specialization`, `/api/game/study-cast`, `/api/rooms/:id/chat`, `/api/rooms/:id/raid-strike`, and `/api/compete/duel`

### Phase 4: Client Types, Audio Studio & Floating PiP Enhancements
- [x] **Types:** Update `src/types.ts` with all v3.0 interfaces (`UniversityCourse`, `FlashcardItem`, `ExamGoal`, `StudyNoteItem`, `RoomRaidState`, `RoomChatMessage`, `LeagueStatus`, `FocusDuel`, `TodayTimelineItem`, etc.)
- [x] **Pillar 2 (Multi-Track Ambient Sound Mixer):** Upgrade `src/utils/soundEngine.ts` with simultaneous multi-channel mixing (`setTrackMix`, `getTrackMix`, `applySavedMixPreset`) while preserving legacy `setPreset`
- [x] **Pillar 3 (Interactive Floating PiP HUD):** Upgrade `src/utils/pipEngine.ts` with `#sp-task-done` task completion button (`onCompleteTask`), live `#sp-peers` room occupant badge, and floating `#sp-toast` milestone/loot banner across Document PiP and Canvas Video PiP

### Phase 5: Frontend Feature Implementation Across All 6 Pillars
- [x] **Pillars 2 & 4 (`src/components/FocusView.tsx` & `src/components/UniversityVaultPanel.tsx`):** Soundscape Mixer Studio sliders, Flowtime earned-break indicator, High-Stakes Coin Wager selector, and **University Vault & Active Learning Hub** (FSRS Flashcards, IPv4 CIDR & Comp-Arch CPI/Amdahl Lab Calculators, Obsidian `.md` Scratchpad & Exam Countdown Planner)
- [x] **Pillars 1 & 6 (`src/components/RoomsView.tsx` & `src/components/RoomTavernCanvas.tsx`):** **Live Pixel Study Tavern** `<canvas>` showing seated peers' pixel heroes & companions with live focus auras, **Synced Room Pomodoro Bar**, **Weekly Co-Op Room Raid Boss** card with `Raid Strike`, and **Room Lounge Chat**
- [x] **Pillars 1 & 4 (`src/components/QuestView.tsx`):** **Study-to-Cast University Quiz** trigger inside dungeon combat & ancient riddles, **Class Specialization Selector**, and **Companion Evolution Stage** badge
- [x] **Pillar 6 (`src/components/CompeteView.tsx` & `src/components/FeedView.tsx`):** **Weekly Tiered Leagues** (`Bronze` -> `Astral`), **1v1 Focus Duel Arena**, and **Feed Session Milestone Badges**
- [x] **Pillar 5 (`src/components/ProfileView.tsx`):** **365-Day Heatmap Toggle**, **Week-over-Week Delta Badge**, **YPT Daily Timeline Receipt Card** with downloadable PNG generator, and **CSV / JSON / iCal (`.ics`) Export Bar**
- [x] **App Wiring (`src/App.tsx`):** Connect all new handlers, WebSocket chat/raid sync, PiP task completion/toast state, and props across tabs

### Phase 6: Verification, Build & Production Deployment
- [x] Run `npx tsc --noEmit` and `npm run build` with zero errors
- [x] Extend Playwright E2E suite (`verify_studypulse.mjs`) covering all 6 pillars and pass locally (`http://127.0.0.1:3125`)
- [ ] Commit & push to `matinz03/studypulse` (`main`), deploy to `ubuntu@92.5.4.155:/srv/apps/studypulse`, rebuild `studypulse-web-1`
- [ ] Pass live Playwright E2E against `https://study.matinz03.tech`, clean temporary `sp_%` test records, and confirm `/api/health`

---

## 4. Verification & Development Runbook

```powershell
# Typecheck & build
npx tsc --noEmit
npm run build

# Run local server (port 3125)
$env:PORT="3125"; $env:NODE_ENV="production"; node server/index.js

# Run full Playwright E2E against local or live target
$env:TARGET_URL="http://127.0.0.1:3125"
node "C:\Users\Damian Zod\.gemini\antigravity\brain\743af130-a4a6-4321-ac87-6c92a2a4a881\scratch\verify_studypulse.mjs"
```

### Database Schema Reference (v3.0)
Core tables in `server/db.js`:
- Existing: `users`, `subjects`, `study_sessions`, `friendships`, `feed_reactions`, `feed_comments`, `study_rooms`, `study_tasks`, `push_subscriptions`, `scheduled_timers`, `user_unlocks`, `shop_purchases`, `game_profiles`, `game_items`.
- v3.0 Additions: `flashcards`, `exam_goals`, `study_notes`, `room_raids`, `room_messages`, `focus_duels` (+ `game_profiles.specialization`).
