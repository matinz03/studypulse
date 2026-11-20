# StudyPulse — Social Focus, Pixel RPG & University Active Learning Studio

StudyPulse is a full-stack, mobile-first & desktop-responsive social focus timer, multi-track ambient sound studio, Floating PiP companion, active learning vault, analytics suite, and persistent pixel-art RPG (*Chronicles of Oakhaven*) built to connect deep-work discipline with authentic Politecnico di Torino coursework.

- **Live Production App:** **https://study.matinz03.tech**
- **University Knowledge Portal (`matinz03/University`):** **https://university.matinz03.tech**

---

## 1. What We Built at Each Step (Explained in Simple Terms)

Here is a plain-English breakdown of every feature added to StudyPulse across each step of its development:

### Step 1 — Clean Accounts & Real User Data Only
- **What it does in simple terms:** When you open the app, there are no fake "demo" or computer-generated users cluttering the leaderboard, study rooms, or activity feed. Every profile, study streak, message, and room participant belongs to a real registered person.
- **Where it lives:** `server/db.js`, `server/index.js`

### Step 2 — Persistent Study Rooms, Desktop Browsing & Room Deletion
- **What it does in simple terms:**
  - **Saved Rooms:** Any custom study room you create (with its own name, icon, and topic tag) is permanently saved in the database so it stays there even if the server restarts or you refresh the page.
  - **Easy Desktop Navigation:** On a laptop or desktop monitor, you don't need to swipe sideways like on a phone — there are Left/Right scroll arrows and a **"Grid / All Rooms"** button so you can see every room at a glance.
  - **Delete Room Button:** Custom rooms have a trash-can button so you can delete a room whenever you're done with it, and the app safely moves anyone inside back to the main library room.
- **Where it lives:** `src/components/RoomsView.tsx`, `server/db.js`, `server/index.js`

### Step 3 — 16 Glassy Dark & Light UI Themes (State-of-the-Art Design)
- **What it does in simple terms:** Added a **Theme Switcher** (top-right palette icon) with **16 total themes (8 Dark + 8 Light)** featuring crisp 1-pixel borders, frosted glass blur, and deep layered shadows:
  - **5 Signature Developer Design Systems (Dark & Light):** *Shadcn Glass* (pure monochrome zinc), *Vercel Geist* (high-contrast obsidian & paper), *Linear App* (cosmic indigo), *Apple VisionOS* (spatial frosted glass), and *Raycast Noir / Daylight* (crimson & slate).
  - **Top 3 Researched Study Color Combinations (Dark & Light):**
    1. **Matcha & Warm Sand (`sage-dark` / `sage-light`):** Calming green and warm cream paper tones designed to reduce eye strain during long reading sessions.
    2. **Nordic & Cobalt (`indigo-dark` / `indigo-light`):** Deep navy and crisp sky-blue accents engineered to keep you alert during technical problem-solving.
    3. **Alabaster & Terracotta (`terracotta-dark` / `terracotta-light`):** Warm espresso and sunset clay tones for a cozy late-night library atmosphere.
- **Where it lives:** `src/themes.ts`, `src/index.css`, `src/components/ThemePickerModal.tsx`

### Step 4 — 4-Tier Rotating Focus Coin Store
- **What it does in simple terms:** Every minute you study earns **Focus Coins** (with bonuses if you don't switch tabs or lose focus). You can spend those coins in an in-app shop split into 4 tabs:
  - **Daily Rotation (resets every 24h):** Quick consumables like healing potions, dungeon torches, whetstones, and XP scrolls, plus a **1× Free Daily Reroll** button to refresh the shelves.
  - **Weekly Rotation (resets every 7 days):** Rare equipment chests, streak shields, and double-coin contracts.
  - **Monthly Rotation (resets every 30 days):** Seasonal titles, relic caches, and rare pixel companions.
  - **Permanent Catalog:** Always-available aesthetic titles, profile badges, sound packs, and starter pets.
- **Where it lives:** `server/shopEngine.js`, `src/components/QuestView.tsx`

### Step 5 — *Chronicles of Oakhaven*: Story-Driven Pixel RPG & Tactical Dungeon Crawler
- **What it does in simple terms:** Turned the RPG tab into a real pixel adventure game where **studying powers your character**:
  - **How Studying Helps You in the Game:** Finishing real study sessions gives your hero **Stamina (`⚡`)** to explore rooms, **Action Charges** for special attacks, **Intuition (`👁️`)** to spot hidden traps and secret treasure walls, and a **Focus Fever (`🔥`)** damage boost when you study for 25+ minutes with 90%+ focus purity.
  - **Walkable Oakhaven Village & Story NPCs:** Between dungeon runs, you can walk around a 2D pixel village, rest at the **Campfire**, pray at the **Shrine of Clarity**, and talk to 4 characters who give you story quests and upgrades: **Elder Rowan** (main story chapters), **Blacksmith Bram** (reforges your weapons/armor), **Alchemist Lyra** (brews potions and torches), and **Scout Pip** (daily monster bounties).
  - **11×9 Fog-of-War Dungeon Map:** Every dungeon floor is a grid hidden in darkness. Moving costs Stamina (`⚡`), torches light up nearby rooms, and clicking **"Search Area (Intuition)"** reveals hidden treasure rooms or disarms spike traps.
  - **Tactical Combat (Your Choices Matter):** Monsters Telegraph their next move above their head (*Heavy Smash*, *Venom Strike*, *Iron Guard*, or *Curse*). If you blindly spam attack against a boss winding up a *Heavy Smash*, you take massive damage — instead, choosing **Parry & Ward** blocks 75% of the hit and counter-strikes, while **Focus Break** shatters an enemy's shield.
- **Where it lives:** `server/gameEngine.js`, `server/dungeonGenerator.js`, `server/storyData.js`, `src/game/pixelSprites.ts`, `src/components/QuestView.tsx`

### Step 6 — Theme-Synced & Focus-Reactive Floating Mini-Window (PiP)
- **What it does in simple terms:** When you pop out the **Floating Mini-Window (Picture-in-Picture)** so it floats on top of your PDFs, lecture slides, or code editor:
  - **Matches Your Theme Live:** Switching between any of the 16 Dark or Light themes immediately recolors the floating window to match.
  - **Living Pixel Hero in the Background:** Your pixel hero and pet live inside the background of the floating timer and visibly react to how deeply you are focusing:
    - *Campfire Idle* (resting by a crackling fire before you start)
    - *Lv.1 Spark* -> *Lv.2 Locked In* -> *Lv.3 Deep Flow* -> *Lv.4 Focus Fever Apex* (as your session goes longer with high focus, your hero draws their weapon, glows with runes, and enters golden Focus Fever)
    - *Focus Shaken!* (if you leave the tab, warning embers appear) and *Break Recharge* (drinking tea by the fire on break).
- **Where it lives:** `src/utils/pipEngine.ts`, `src/App.tsx`

### Step 7 (v3.0 Pillar 1) — Co-Op Multiplayer RPG Inside Study Rooms
- **What it does in simple terms:** Studying in a room with friends now connects directly to the RPG:
  - **Live Pixel Study Tavern:** At the top of every Study Room, a live pixel-art tavern canvas renders **every person currently in the room** as their chosen hero class and pet sitting at wooden study desks (when focusing) or warming up by the hearth (when on break/idle).
  - **Weekly Co-Op Room Raid Boss:** Each study room has a shared monster boss (like *Chronos Devourer of Deadlines*) with a collective HP bar. Every minute anyone in the room studies — or whenever someone spends `1⚡` on a **Raid Strike** — it damages the boss for the whole group and drops bonus coins.
  - **Hero Specializations & 3-Stage Pet Evolution:** Heroes can pick a subclass mastery (*Chrono Blade* / *Iron Bulwark* for Vanguard, *Astral Weaver* / *Riddle Sage* for Arcanist, *Nightstrider* / *Fortune Seeker* for Shadow), and pets evolve from **Stage I Hatchling** to **Stage II Awakened** and **Stage III Mythic Ascendant** as your hero levels up.
- **Where it lives:** `src/components/RoomTavernCanvas.tsx`, `src/components/RoomsView.tsx`, `server/gameEngine.js`, `server/index.js`

### Step 8 (v3.0 Pillar 2) — Multi-Track Sound Mixer, Flowtime & Coin Wagers
- **What it does in simple terms:**
  - **Simultaneous Sound Mixer Studio:** Instead of picking only one background sound at a time, you can open the **Sound Mixer** and blend sliders for **Rain**, **Fireplace**, **Brown Noise**, **40Hz Gamma Waves**, **Cozy Café**, and **Library** all at once, or click 1-tap combos (*Stormy Library*, *Hearth & Café*, *40Hz Deep Lab*).
  - **Flowtime Earned Break Tracker:** When using the open-ended **Flow** timer mode, the app automatically calculates how many minutes of guilt-free break you've earned (1 minute of break for every 5 minutes of deep work).
  - **High-Stakes Coin Wagers:** Before starting a 10+ minute session, you can bet **15 or 30 Coins** on yourself. Finish with 85%+ focus purity to win **2× your wager back**; get distracted and you forfeit the stake.
- **Where it lives:** `src/utils/soundEngine.ts`, `src/components/FocusView.tsx`, `server/index.js`

### Step 9 (v3.0 Pillar 3) — Interactive Floating PiP Controls & Reward Toasts
- **What it does in simple terms:** You can now **check off your current to-do task (`✓ Done`) directly inside the floating mini-window** without clicking back into the main browser tab, see a live counter of how many peers are studying in your room (`👥 N live`), and see floating pixel notifications whenever you complete a task or hit a focus milestone.
- **Where it lives:** `src/utils/pipEngine.ts`, `src/App.tsx`

### Step 10 (v3.0 Pillar 4) — `University` Vault Integration & "Study-to-Cast" Combat
- **What it does in simple terms:** Connected your **`matinz03/University` repository (`https://university.matinz03.tech`)** directly into StudyPulse's Focus tab and RPG dungeon:
  - **4 Politecnico di Torino Courses & 32 Smart Flashcards:** Pre-loaded with your real notes and exam concepts from *Computer Architectures*, *Data Science & Database Technology*, *Cloud Computing Technologies*, and *Internet Architecture* using spaced-repetition scheduling (`Again`, `Hard`, `Good`, `Easy`) so cards reappear right before you forget them.
  - **Interactive Lab Calculators:**
    - **IPv4 CIDR & Host-Sizing Tutor** (from your *Internet Architecture Exercise 01c*): Enter any required host count (e.g., `550` hosts) and it walks step-by-step through `hosts + 2 -> power of two -> /prefix -> netmask -> usable range`.
    - **CPU Pipeline CPI, ASE Studio (`1750 Hz`) & Amdahl's Law Calculator** (from your *Computer Architectures Lab 01 & 02*): Computes CPI, execution time at `1750 Hz`, and parallel speedup live.
  - **Obsidian `00 Inbox` Markdown Scratchpad & Exam Pacing:** Write quick study notes with recall questions during a timer session and click **Export `.md`** to download a file formatted with your exact Obsidian YAML frontmatter (`type: learning-progress`), plus track how many minutes per day you need to study before an upcoming exam date.
  - **"Study-to-Cast" in the RPG Dungeon:** During a monster battle or ancient shrine riddle in the RPG, you can click **`📖 Vault Quiz`**. Answering a real multiple-choice question from your 4 university courses unleashes a **`1.65×` Critical Arcane Strike** (or solves the riddle) while rewarding bonus coins and XP.
- **Where it lives:** `server/universityData.js`, `src/components/UniversityVaultPanel.tsx`, `src/components/FocusView.tsx`, `src/components/QuestView.tsx`

### Step 11 (v3.0 Pillars 5 & 6) — 365-Day Analytics, Daily Focus Receipt, Synced Rooms & Weekly Leagues
- **What it does in simple terms:**
  - **90-Day / 365-Day Heatmap & Week-over-Week Trend:** Toggle your study calendar between 90 days and a full 365-day year view, and see a live `%` badge showing how this week compares to last week.
  - **Shareable Daily Focus Receipt (PNG) & Data Exports:** View a visual timeline of every session you completed today with its focus purity score, download a crisp **Daily Focus Receipt PNG** image card, or export your full history as **CSV**, **JSON**, or an **iCal (`.ics`)** calendar file.
  - **Synced Room Pomodoro Clock & Lounge Chat:** Every study room has a shared **25m Focus / 5m Break** group clock so everyone in the room can cycle together, plus a live **Room Lounge Chat** for quick encouragement.
  - **Weekly Tiered Leagues & 7-Day Focus Pacts:** Climb through 6 weekly league divisions (*Bronze -> Silver -> Gold -> Diamond -> Obsidian -> Astral*) with automatic promotion/demotion zones, challenge any study partner to a **7-Day 1v1 Focus Pact**, and earn milestone badges (`🔥 Fever Master`, `👑 Marathon 60m+`, `🎯 Pure Focus 95%+`) on the social feed.
- **Where it lives:** `src/components/ProfileView.tsx`, `src/components/RoomsView.tsx`, `src/components/CompeteView.tsx`, `src/components/FeedView.tsx`

---

## 2. Tech Stack & Repository Layout

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4 (`src/index.css`), Framer Motion, Lucide Icons, HTML5 Canvas pixel-art renderer (`src/game/pixelSprites.ts`, `src/components/RoomTavernCanvas.tsx`), Web Audio multi-track procedural synthesizer (`src/utils/soundEngine.ts`), Floating Document + Video PiP engine (`src/utils/pipEngine.ts`), Service Worker + Web Push (`public/sw.js`).
- **Backend:** Node.js + Express (`server/index.js`), WebSocket live presence & room sync (`ws`), SQLite via `better-sqlite3` (`server/db.js` WAL mode + foreign keys + safe idempotent migrations), Web Push VAPID notifications (`web-push`), Procedural Pixel RPG (`server/gameEngine.js`, `server/dungeonGenerator.js`, `server/storyData.js`), 4-tier Rotating Coin Store (`server/shopEngine.js`), University Vault Curriculum Seed (`server/universityData.js`).
- **Themes:** 16 Dark/Light themes (`src/themes.ts`) synchronized across main UI, Service/PWA chrome, and Floating PiP HUD (`shadcn-dark/light`, `vercel/vercel-light`, `linear/linear-light`, `apple-glass/apple-light`, `raycast/raycast-light`, `sage-dark/light`, `indigo-dark/light`, `terracotta-dark/light`).

---

## 3. `University` Repository Integration Architecture

Sourced directly from `C:\Users\Damian Zod\Documents\University` (`matinz03/University` Obsidian vault + Quartz portal `https://university.matinz03.tech`):

| Vault Source | Content Integrated into StudyPulse | StudyPulse Module |
| :--- | :--- | :--- |
| `10 Courses/*.md` & `Connected Reading Guide.md` | 4 core courses, exam targets, & sequential concept reading trails (*RISC-V -> Pipelining -> Dynamic Scheduling -> Speculation*, *DW -> KDD -> Apriori -> Clustering*, *Virtualization -> Cgroups -> Docker -> Cloud/Edge*, *IPv4 -> Cellular -> IPv6 -> OSPF -> BGP*). | `server/universityData.js`, `src/components/UniversityVaultPanel.tsx` |
| `20 Concepts/*` (181 atomic concept notes) & `00 Inbox/* - Learning Progress` | 32 FSRS spaced-repetition flashcards + 4-choice quiz cards covering hazards, Tomasulo, ROB, cache policies, ROLAP/MOLAP/HOLAP, Apriori/FP-growth, Silhouette/DBSCAN, VT-x/EPT, namespaces/cgroups, CIDR, GSM/LTE/5G, and OSPF/BGP; plus recall prompts seeded into study notes. | `server/universityData.js`, `flashcards` & `study_notes` tables, `POST /api/university/review`, `POST /api/game/study-cast` |
| `10 Courses/Internet Architecture.../Exercises/` | Interactive **IPv4 CIDR & Host-Sizing Step-by-Step Calculator** preserving the `hosts + 2 -> power of two -> host bits h -> /prefix (32-h) -> binary/decimal netmask -> usable range` workflow + `/31` point-to-point clarification. | `src/components/UniversityVaultPanel.tsx` -> Calculators Tab |
| `50 Labs/Computer Architectures/Lab 01 & 02` | Interactive **CPU Pipeline CPI, Weighted Execution Time ($T_i = \text{cycles}_i / 1750\text{ Hz}$) & Amdahl's Law ($S = 1 / ((1 - p) + p/s)$) Calculator** matching the ASE Studio / gem5 lab workflows. | `src/components/UniversityVaultPanel.tsx` -> Calculators Tab |
| `00 Inbox/* - Learning Progress` Markdown convention | Built-in **Obsidian Session Scratchpad & Learning Progress Composer** with 1-click download of frontmatter-tagged `.md` files (`type: learning-progress`, recall prompts, source links) ready to drop directly into `00 Inbox/`. | `src/components/UniversityVaultPanel.tsx` -> Notes & Exams Tab |

---

## 4. StudyPulse v3.0 — 6-Pillar Implementation Roadmap & Handoff Status

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
- [x] Commit & push to `matinz03/studypulse` (`main`), deploy to `ubuntu@92.5.4.155:/srv/apps/studypulse`, rebuild `studypulse-web-1`
- [x] Pass live Playwright E2E against `https://study.matinz03.tech`, clean temporary `sp_%` test records, and confirm `/api/health`

---

## 5. Verification & Development Runbook

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
