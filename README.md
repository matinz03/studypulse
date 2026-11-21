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

### Step 12 — Multi-Layer Procedural Web Audio Soundscape Engine
- **What it does in simple terms:** Rebuilt the Focus Soundscape synthesizer so every ambient channel sounds warm, organic, and loop-free:
  - **Brown Noise (`buildBrownChannel`):** Seamless 8-second crossfaded true integrated Brownian (`1/f²`) noise with sub-rumble high-pass (`28 Hz`) and warm low-pass (`620 Hz`).
  - **Crackling Fireplace (`buildFireChannel`):** 3-layer hearth rumble + flickering flame roar + live stochastic wood crackle, resin snaps, and ember pops.
  - **Cozy Café (`buildCafeChannel`):** Warm espresso bar air + 4-table formant-filtered vowel conversational murmur + procedural porcelain cup/saucer clinks, spoon stirs, and espresso steam bursts.
  - **Quiet Library (`buildLibraryChannel`):** Hushed reading-room presence + rhythmic 1 Hz wooden grandfather clock tick-tock + 2-stage paper page turns and soft pencil writing strokes.
- **Where it lives:** `src/utils/soundEngine.ts`

### Step 13 — UI/UX Pro Max Bento Redesign of Focus & Me Pages + `+5m` Live Timer Extension
- **What it does in simple terms:**
  - **Unified Focus Chronometer Cockpit:** Widened the primary workspace column to `560px`, unified the timer dial, 2-line mobile-safe Goal% & Room live counter header, progressive subject pills (`+N more`), and a **3-Tab Focus Workbench (`Uni Vault` | `Task Queue` | `Split View`)** so you never have to scroll past a long vertical stack.
  - **`+5m` Extends Current Timer Duration:** Clicking **`+5m`** adds 5 minutes (`+300s`) directly to your active countdown target (`25:00 -> 30:00 -> 35:00`) and reschedules the server lock-screen alarm automatically.
  - **Me Page Bento Analytics & 4-Section Filter:** Added a 4-tile KPI Bento Header (*Total Focus*, *Focus Purity*, *Best Hour*, *Coins & Streak*), a 4-tab view switcher (`All Bento` | `Analytics` | `Receipt & Data` | `Shop & Badges`), and 2-column responsive Bento cards.
- **Where it lives:** `src/components/FocusView.tsx`, `src/components/ProfileView.tsx`, `src/components/StorePanel.tsx`, `src/App.tsx`

### Step 14 — 320-Question Politecnico di Torino Master Test Bank & Timed Mock Exam Simulator
- **What it does in simple terms:**
  - **320 Exam-Grade Multiple-Choice Questions (`80` per Course):** Expanded the active-recall vault from 32 starter cards to **320 categorized questions** across *Computer Architectures* (`80`), *Data Science & Database Technology* (`80`), *Cloud Computing Technologies* (`80`), and *Internet Architecture* (`80`), tagged by category (**166 Theory**, **52 Code/Trace**, **102 Numeric**) and difficulty (**Core**, **Exam**, **Lab**).
  - **Timed Mock Exam Simulator:** Configure a **5, 10, 15, or 20-question Timed Mock Exam** filtered by course and category (`All`, `Theory`, `Code/Trace`, `Numeric`) with a live countdown clock, question navigator pills, detailed answer key explanations, FSRS spaced-repetition batch grading (`POST /api/university/exam-complete`), and automatic XP, Coin, and Arcane Shard rewards.
  - **Auto-Distractor Generator for Custom Notes:** Paste any `Question :: Answer` note and the server automatically generates 3 plausible course-matched multiple-choice distractors.
- **Where it lives:** `server/universityQuestionBank.js`, `server/universityData.js`, `server/db.js`, `server/index.js`, `src/components/UniversityVaultPanel.tsx`

### Step 15 — High-Contrast Dungeon Stone Masonry Walls vs. Walkable Flagstone Paths
- **What it does in simple terms:** Made open corridors vs. closed walls immediately distinguishable inside the 11×9 dungeon viewport:
  - **Recessed Dark Masonry Walls & Bright Corridor Rims:** Wall tiles render with dark 2-course staggered stone masonry and a crisp `2px` biome-accented perimeter border wherever a wall borders an open floor.
  - **Bright Flagstone Walkways & Step Guides:** Open tiles render with high-contrast beveled flagstones, northern wall drop-shadows, green walkable step outlines on adjacent tiles, and D-Pad buttons that light up emerald when open or dim when blocked by a wall.
- **Where it lives:** `src/game/pixelSprites.ts`, `src/game/PixelCanvas.tsx`, `src/components/QuestView.tsx`

### Step 16 — *Chronicles of Oakhaven* Tactical RPG Overhaul: Vanguard Party, Mythic Side Stories, Break Shields, Dash Flanking, Dual-Tech Finishers & Heroic Deeds
- **What it does in simple terms:**
  - **Recruitable Vanguard Party Squad (4 Allies):** Recruit **Sir Kaelen** (*Iron Vanguard*), **Lyra Thorn** (*Combat Alchemist*), **Pip Swiftfoot** (*Starlight Ranger*), and **Vespera** (*Astral Chronomancer*). Your active party ally visibly stands beside you in battle on the pixel canvas, grants a permanent passive stat aura, and unlocks an active **Ally Assist (`ally_skill`)** plus a **Dual-Tech Ultimate Finisher (`finisher`)**.
  - **Enemy Guard Shields (`🛡️`) & `💥 GUARD BROKEN!` Stagger:** Monsters and Bosses carry 2–3 Guard Shields rendered above their sprite. Breaking all shields with *Focus Break*, *Flanking Backstabs*, *Perfect Parries*, *Study Casts*, or *Ally Assists* triggers **`💥 GUARD BROKEN!`** — stunning the enemy, inflicting **+50% Vulnerable DMG**, and unlocking early Finishers.
  - **Tactical Movements (`💨 Dash Flank`):** Dash to gain **+45% Evasion** (triggering an automatic **Sidestep Counter-Cut** if you dodge) and enter **Flanking Stance** (cyan speed-afterimage on the canvas; your next Strike becomes **`⚡ Flank Backstab!`** with Guaranteed Critical damage and `-1🛡️` Shield Break).
  - **Cinematic Dual-Tech Ultimate Finishers:** Unleash *Dawnbreaker Cross-Slash*, *Eclipse Supernova Elixir*, *Phantom Arrow Storm*, or *Chrono Singularity Collapse* for `2.75×–3.1× ATK` multi-hit critical damage with golden-crimson cross-slash beams and **+35% bonus Shards / +25% bonus Hero XP** on a Finisher kill.
  - **3-Act Branching Mythic Side Stories & `[MYTHIC]` Relics:** Play through 4 multi-act narrative side stories (*The Sunken Belltower of Oakhaven*, *Bram's Star-Forged Oath*, *Lyra's Eclipse Panacea*, *The Astral Phoenix's Rebirth*) where your heroic choices forge guaranteed **`[MYTHIC]` Relics** (*Dawnchime Astral Blade*, *Aegis of the First Archivist*, *Chrono-Hourglass of Oakhaven*, *Solaria, Mythic Astral Phoenix*).
  - **Heroic Deeds & Titles Ledger + 0-Energy Trial Arena:** Complete 6 tracked combat/story deeds for permanent stat upgrades (`+ATK`, `+DEF`, `+Max HP`, `+LUCK`) and Heroic Titles, and jump into a **`⚔️ Trial Battle (0⚡)`** anytime to test your squad.
- **Where it lives:** `server/storyData.js`, `server/gameEngine.js`, `server/index.js`, `src/game/PixelCanvas.tsx`, `src/components/QuestView.tsx`, `src/types.ts`

### Step 17 — *Aethelgard: Astral Vanguard* (Hybrid 24/7 + Study-Overdrive Side-Scrolling 4-Hero Idle RPG Reboot)
- **What it does in simple terms:** Rebooted the Quest tab into a full **24/7 Side-Scrolling 4-Hero Idle Auto-Battler** synced with your focus sessions:
  - **Side-Scrolling 4-Hero Auto-Battler Canvas (Two-Way ATB Clashes):** Watch your 2×2 Squad (*Solarius*, *Kaelis*, *Aurelia*, *Seraphina*) + flying Familiar Pet alternate between **Marching phases** (`+22% HP` inter-wave recovery) and **Planted Combat Clashes** across 5 parallax realms (*Verdant Sky-Bastion*, *Chrono-Forge Citadel*, *Prism Frost Caverns*, *Eclipse Void Sanctum*, *Singularity Throne*). Features individual 4-Hero **HP + Cyan Barrier + ATB Gauges (`0% -> 100%`)**, **2-Enemy Pack Waves** + **Wave 10 Boss & Royal Guard**, Crimson Enemy Counterattack ATB (`CLEAVE`/`VOLLEY`), **25s Boss Enrage Countdown**, Guard Shield breaking (`🛡️` -> `💥 BROKEN!`), and synchronized **Squad Ultimate Cross-Slash Finishers**.
  - **Boss Wall & Retreat Loop + Battle Pace Selector:** If the squad wipes, they retreat cleanly to safe Waves 1–9 farming (`👑 Challenge Stage Boss` banner) until upgrades or Study Overdrive turn the tide. Includes **`1× Tactical | 2× Brisk | ⚡ Max`** Battle Pace controls and a live **Squad Power vs. Stage Rec Power & Enemy DPS** meter.
  - **Hybrid 24/7 + `4.0×` Study Overdrive Loop:** Your squad farms 24/7 (including offline up to a **12-Hour AFK Loot Chest**), and accelerates into **`3.5×–5.0×` Study Overdrive** whenever your **Focus Timer runs** or after answering a **`🎓 Study Overdrive Quiz`** from the 320-question University bank (`+30m 4.0×` speed & `+2` bonus waves).
  - **4-Hero Formation & AI Gambits:** Swap heroes between Front Vanguard and Back Row (`Swap Row`) and set AI rules (*Squad Finisher Timing*, *Auto-Target Priority*, *Stage Auto-Push vs. Farm*, and *Seraphina Heal Threshold*).
  - **24/7 Idle Guild Professions:** Upgrade the *Astral Shard Quarry* (`⛏️`), *Starlight Alchemy Guild* (`⚗️`), and *Chrono-Rune Archive* (`📜`) for continuous hourly yields and permanent Squad multipliers.
  - **Zero-Micromanagement Auto-Equip & Auto-Salvage:** Toggle **Auto-Equip Best Gear** (compares item Power Score automatically) and **Auto-Salvage (`Off | Common | Uncommon | Rare`)** so your inventory manages itself cleanly.
  - **Celestial Ascension Rebirth & `[MYTHIC]` Forges:** Ascend at Stage 2+ to earn permanent **Celestial Embers (`🔥`)** and rank up 4 multiplicative **Ascension Relics**, plus forge 4 Aethelgard `[MYTHIC]` Relics (*Dawnstar Greatsword*, *Aegis of the Eternal Rift*, *Chrono-Singularity Core*, *Solaria, Mythic Astral Phoenix*).
- **Where it lives:** `server/storyData.js`, `server/gameEngine.js`, `server/index.js`, `src/game/PixelCanvas.tsx`, `src/components/QuestView.tsx`, `src/types.ts`, `src/App.tsx`

---

## 2. Tech Stack & Repository Layout

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4 (`src/index.css`), Framer Motion, Lucide Icons, HTML5 Canvas pixel-art renderer (`src/game/pixelSprites.ts`, `src/game/PixelCanvas.tsx`, `src/components/RoomTavernCanvas.tsx`), Web Audio multi-track procedural synthesizer (`src/utils/soundEngine.ts`), Floating Document + Video PiP engine (`src/utils/pipEngine.ts`), Service Worker + Web Push (`public/sw.js`).
- **Backend:** Node.js + Express (`server/index.js`), WebSocket live presence & room sync (`ws`), SQLite via `better-sqlite3` (`server/db.js` WAL mode + foreign keys + safe idempotent migrations), Web Push VAPID notifications (`web-push`), Procedural Pixel RPG (`server/gameEngine.js`, `server/dungeonGenerator.js`, `server/storyData.js`), 4-tier Rotating Coin Store (`server/shopEngine.js`), 320-Question University Vault Curriculum & Master Test Bank (`server/universityData.js`, `server/universityQuestionBank.js`).
- **Themes:** 16 Dark/Light themes (`src/themes.ts`) synchronized across main UI, Service/PWA chrome, and Floating PiP HUD (`shadcn-dark/light`, `vercel/vercel-light`, `linear/linear-light`, `apple-glass/apple-light`, `raycast/raycast-light`, `sage-dark/light`, `indigo-dark/light`, `terracotta-dark/light`).

---

## 3. `University` Repository Integration Architecture

Sourced directly from `C:\Users\Damian Zod\Documents\University` (`matinz03/University` Obsidian vault + Quartz portal `https://university.matinz03.tech`):

| Vault Source | Content Integrated into StudyPulse | StudyPulse Module |
| :--- | :--- | :--- |
| `10 Courses/*.md` & `Connected Reading Guide.md` | 4 core courses, exam targets, & sequential concept reading trails (*RISC-V -> Pipelining -> Dynamic Scheduling -> Speculation*, *DW -> KDD -> Apriori -> Clustering*, *Virtualization -> Cgroups -> Docker -> Cloud/Edge*, *IPv4 -> Cellular -> IPv6 -> OSPF -> BGP*). | `server/universityData.js`, `src/components/UniversityVaultPanel.tsx` |
| `20 Concepts/*` (181 atomic concept notes), `50 Labs/*` & `00 Inbox/*` | **320 FSRS Spaced-Repetition & Timed Mock Exam Questions** (`80` per course across `comp_arch`, `data_science`, `cloud_comp`, `internet_arch`, categorized into **166 Theory**, **52 Code/Trace**, and **102 Numeric** problems) + auto-distractor generator for custom notes. | `server/universityQuestionBank.js`, `server/universityData.js`, `flashcards` table, `POST /api/university/review`, `POST /api/university/exam-complete`, `POST /api/game/study-cast` |
| `10 Courses/Internet Architecture.../Exercises/` | Interactive **IPv4 CIDR & Host-Sizing Step-by-Step Calculator** preserving the `hosts + 2 -> power of two -> host bits h -> /prefix (32-h) -> binary/decimal netmask -> usable range` workflow + `/31` point-to-point clarification. | `src/components/UniversityVaultPanel.tsx` -> Calculators Tab |
| `50 Labs/Computer Architectures/Lab 01 & 02` | Interactive **CPU Pipeline CPI, Weighted Execution Time ($T_i = \text{cycles}_i / 1750\text{ Hz}$) & Amdahl's Law ($S = 1 / ((1 - p) + p/s)$) Calculator** matching the ASE Studio / gem5 lab workflows. | `src/components/UniversityVaultPanel.tsx` -> Calculators Tab |
| `00 Inbox/* - Learning Progress` Markdown convention | Built-in **Obsidian Session Scratchpad & Learning Progress Composer** with 1-click download of frontmatter-tagged `.md` files (`type: learning-progress`, recall prompts, source links) ready to drop directly into `00 Inbox/`. | `src/components/UniversityVaultPanel.tsx` -> Notes & Exams Tab |

---

## 4. StudyPulse v3.0+ — Implementation Roadmap & Handoff Status

> **Agent Handoff Convention:** Keep checkboxes below updated immediately after each milestone is implemented and verified (`npx tsc --noEmit && npm run build` + Playwright E2E).

### Phase 1: Living Architecture & Handoff Documentation
- [x] Research competitor landscape (*Yeolpumta*, *Spirit City*, *Habitica*, *Forest*, *Focus Tree*, *Flocus*, *StudyNook*) and audit `C:\Users\Damian Zod\Documents\University`
- [x] Architect full 6-Pillar roadmap and document integration map in `README.md`

### Phase 2: University Curriculum Data & SQLite Schema Migrations
- [x] **Pillar 4 / University Seed:** Create `server/universityData.js` (`UNIVERSITY_PORTAL_URL`, `UNIVERSITY_COURSES`, `UNIVERSITY_FLASHCARDS`)
- [x] **Database Migrations:** Update `server/db.js` with `flashcards`, `exam_goals`, `study_notes`, `room_raids`, `room_messages`, `focus_duels`, plus `specialization`, `category`, and `difficulty` columns, and export `ensureUniversitySeed(userId)`

### Phase 3: Backend Engines & REST/WebSocket Endpoints
- [x] **Pillar 1 (Co-Op & RPG Mastery):** Update `server/gameEngine.js` with `HERO_SPECIALIZATIONS` (2 masteries per hero class), `selectSpecialization()`, `companionEvolution` stage computation, and `resolveStudyCast()` (FSRS flashcard quiz -> critical RPG strike / riddle solve)
- [x] **Pillars 1, 2, 4, 5, 6 (Server APIs):** Update `server/index.js`:
  - [x] Enrich `buildRoomOccupants()` with hero sprite metadata, `raid` (Weekly Room Raid Boss), `syncTimer` (deterministic 25m/5m shared Pomodoro phase), and recent `messages` (Room Lounge Chat)
  - [x] Extend `POST /api/sessions` with `wagerCoins` (high-stakes focus contracts) and automatic Co-Op Room Raid Boss damage
  - [x] Expand `buildBootstrap()` with `heatmap365`, `prevWeekMins`, `todayTimeline`, `university`, `league`, and `activeDuel`
  - [x] Implement `/api/university/*`, `/api/game/specialization`, `/api/game/study-cast`, `/api/rooms/:id/chat`, `/api/rooms/:id/raid-strike`, and `/api/compete/duel`

### Phase 4: Client Types, Audio Studio & Floating PiP Enhancements
- [x] **Types:** Update `src/types.ts` with all v3.0+ interfaces (`UniversityCourse`, `FlashcardItem`, `ExamGoal`, `StudyNoteItem`, `RoomRaidState`, `RoomChatMessage`, `LeagueStatus`, `FocusDuel`, `TodayTimelineItem`, `PartyAllyInfo`, `MythicSideStoryInfo`, `HeroicDeedInfo`, etc.)
- [x] **Pillar 2 (Multi-Track Ambient Sound Mixer):** Upgrade `src/utils/soundEngine.ts` with simultaneous multi-channel mixing (`setTrackMix`, `getTrackMix`, `applySavedMixPreset`) and multi-layer procedural generators for `brown`, `fire`, `cafe`, and `library`
- [x] **Pillar 3 (Interactive Floating PiP HUD):** Upgrade `src/utils/pipEngine.ts` with `#sp-task-done` task completion button (`onCompleteTask`), live `#sp-peers` room occupant badge, and floating `#sp-toast` milestone/loot banner across Document PiP and Canvas Video PiP

### Phase 5: Frontend Feature Implementation Across All 6 Pillars
- [x] **Pillars 2 & 4 (`src/components/FocusView.tsx` & `src/components/UniversityVaultPanel.tsx`):** Unified Focus Chronometer Cockpit, `+5m` live timer extension, Soundscape Mixer Studio sliders, Flowtime earned-break indicator, High-Stakes Coin Wager selector, and **University Vault & Active Learning Hub** (320-Question FSRS Flashcards, **Timed Mock Exam Simulator**, IPv4 CIDR & Comp-Arch CPI/Amdahl Lab Calculators, Obsidian `.md` Scratchpad & Exam Countdown Planner)
- [x] **Pillars 1 & 6 (`src/components/RoomsView.tsx` & `src/components/RoomTavernCanvas.tsx`):** **Live Pixel Study Tavern** `<canvas>` showing seated peers' pixel heroes & companions with live focus auras, **Synced Room Pomodoro Bar**, **Weekly Co-Op Room Raid Boss** card with `Raid Strike`, and **Room Lounge Chat**
- [x] **Pillars 1 & 4 (`src/components/QuestView.tsx`):** **Study-to-Cast University Quiz** trigger inside dungeon combat & ancient riddles, **Class Specialization Selector**, and **Companion Evolution Stage** badge
- [x] **Pillar 6 (`src/components/CompeteView.tsx` & `src/components/FeedView.tsx`):** **Weekly Tiered Leagues** (`Bronze` -> `Astral`), **1v1 Focus Duel Arena**, and **Feed Session Milestone Badges**
- [x] **Pillar 5 (`src/components/ProfileView.tsx`):** **4-Tile KPI Bento Header**, **4-Section Filter (`All Bento` | `Analytics` | `Receipt & Data` | `Shop & Badges`)**, **365-Day Heatmap Toggle**, **Week-over-Week Delta Badge**, **YPT Daily Timeline Receipt Card** with downloadable PNG generator, and **CSV / JSON / iCal (`.ics`) Export Bar**
- [x] **App Wiring (`src/App.tsx`):** Connect all new handlers, WebSocket chat/raid sync, PiP task completion/toast state, and props across tabs

### Phase 6: Verification, Build & Production Deployment
- [x] Run `npx tsc --noEmit` and `npm run build` with zero errors
- [x] Extend Playwright E2E suite (`verify_studypulse.mjs`) covering all 6 pillars and pass locally (`http://127.0.0.1:3125`)
- [x] Commit & push to `matinz03/studypulse` (`main`), deploy to `ubuntu@92.5.4.155:/srv/apps/studypulse`, rebuild `studypulse-web-1`
- [x] Pass live Playwright E2E against `https://study.matinz03.tech`, clean temporary `sp_%` test records, and confirm `/api/health`

### Phase 7: 320-Question Master Test Bank, Dungeon Wall/Path Clarity & Tactical RPG Overhaul
- [x] **320-Question Master Test Bank & Mock Exam Simulator:** Create `server/universityQuestionBank.js` (`288` new + `32` base = `320` total questions, `80` per course), add `POST /api/university/exam-complete`, and build the Timed Mock Exam Simulator in `src/components/UniversityVaultPanel.tsx`
- [x] **Dungeon Wall vs. Open Walkable Path Clarity:** High-contrast recessed masonry walls, `2px` corridor rim borders, beveled flagstone floors, adjacent step indicators in `src/game/PixelCanvas.tsx`, and open/blocked D-Pad indicators in `src/components/QuestView.tsx`
- [x] **Tactical RPG Overhaul (*Chronicles of Oakhaven*):** Add `PARTY_ALLIES` (4 recruitable party members), `MYTHIC_SIDE_STORIES` (4 3-Act narrative side stories rewarding `[MYTHIC]` relics), `HEROIC_DEEDS` (6 permanent stat & title deeds), Enemy Break Shields (`🛡️`), `💨 Dash Flank` movement & Flanking Backstabs, `🤝 Ally Assist`, `🌟 Dual-Tech Ultimate Finishers`, and `⚔️ Vanguard Trial Arena (0⚡)` across `server/storyData.js`, `server/gameEngine.js`, `server/index.js`, `src/game/PixelCanvas.tsx`, and `src/components/QuestView.tsx`
- [x] Verify live on `https://study.matinz03.tech` with Playwright (`verify_rpg_overhaul.mjs`) and clean temporary `sp_%` test users

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
node "C:\Users\Damian Zod\.gemini\antigravity\brain\743af130-a4a6-4321-ac87-6c92a2a4a881\scratch\verify_rpg_overhaul.mjs"
```

### Database Schema Reference (v3.0+)
Core tables in `server/db.js`:
- Existing: `users`, `subjects`, `study_sessions`, `friendships`, `feed_reactions`, `feed_comments`, `study_rooms`, `study_tasks`, `push_subscriptions`, `scheduled_timers`, `user_unlocks`, `shop_purchases`, `game_profiles`, `game_items`.
- v3.0+ Additions: `flashcards` (`category`, `difficulty`), `exam_goals`, `study_notes`, `room_raids`, `room_messages`, `focus_duels` (+ `game_profiles.specialization`, `story_flags_json` storing `recruitedAllies`, `activeAllyId`, `sideStories`, `deedStats`, and `claimedDeeds`).
