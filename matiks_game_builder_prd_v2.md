# Matiks Game Builder — Product Requirements Document

**Feature:** User-Generated Game Creation ("Create" Mode)
**Prepared by:** Mridul Tiwari
**Version:** 2.0
**Status:** Concept Prototype

---

## 1. Background

Every game on Matiks today — Cross Math, Math Maze, Ken Ken, Sudoku, arithmetic drills — is authored by the Matiks team. The platform has two categories of content: Puzzles (4 daily) and Maths (2 daily). Both reset every 24 hours and are identical for every player.

This means the content velocity is entirely bottlenecked by internal engineering capacity. There is no mechanism for teachers, power users, or community members to contribute.

The Game Builder changes this. It lets any user design a playable Matiks game using the same visual primitives the app already uses, publish it with a shareable link, and contribute to a growing library of community-created content.

The end output of every user-created game is a structured JSON config. The existing Matiks game engine plays it without any changes to the runtime. The Builder is a new authoring surface, not a new execution engine.

---

## 2. Problem Statement

**For creators:** There is no way to express a game idea on Matiks. Teachers who want custom drills for their students, competitive players who invent new puzzle formats in their heads, and community members who want to challenge friends with something they built — all have nowhere to go.

**For Matiks:** Content volume is capped by internal bandwidth. User-generated content is the only path to scale without proportionally scaling engineering. It also deepens platform stickiness: creators have a reason to return and promote their games.

---

## 3. Goals

- Let users build a fully playable Matiks game without writing code
- Reuse existing game component primitives (equation boxes, grids, timers, answer inputs)
- Keep the output compatible with the existing game engine (JSON config)
- Make sharing frictionless (one-tap shareable link or challenge)
- Keep the builder UI consistent with Matiks' existing dark, high-contrast aesthetic

---

## 4. Non-Goals (V1)

- Multiplayer / live duel mode for user-created games (V2)
- Per-game leaderboards for community games (V2)
- Creator monetisation or reward system (V3)
- Complex custom grid-layout editors like KenKen cage drawing (V2)
- Backend infrastructure — this prototype covers frontend only

---

## 5. User Personas

**The Teacher**
Priya teaches Grade 6 math in Pune. She uses Matiks for her classroom but wants to create a custom multiplication drill tuned to her syllabus. She is not technical. She needs a builder that feels as intuitive as Google Forms.

**The Power User**
Arjun is ranked in the top 500 on Matiks globally. He has invented a mental math format in his head that he thinks is harder than anything on the app. He wants to build it and challenge his friends.

**The Casual Creator**
Sneha plays Matiks daily on her commute. She wants to send a custom math puzzle to her sister as a birthday challenge. She does not care about publishing — she just wants a shareable link.

---

## 6. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-01 | Teacher | Create a custom arithmetic drill with specific number ranges | My students practice exactly what we covered in class |
| US-02 | Power user | Design a new puzzle format using existing components | I can challenge friends with something I invented |
| US-03 | Casual creator | Build a quick math challenge and share a link | I can send it to someone without them needing to find it on the app |
| US-04 | Any creator | Preview my game before publishing | I can catch broken configs before others play it |
| US-05 | Any user | Browse and play games made by the community | I can discover new formats beyond the daily challenges |
| US-06 | Any creator | See how many people have played my game | I can feel rewarded for creating something people enjoy |
| US-07 | Teacher | Set a time limit and difficulty tag on my game | Students and parents can find it easily and know what to expect |
| US-08 | Any creator | Edit my published game | I can fix mistakes after publishing |

---

## 7. Feature Scope — MVP

### In Scope
- Canvas-based visual game builder
- Component tray with 4 draggable components
- Per-component config panel (generator + validator settings)
- Global game settings (rounds, time limit, difficulty, name)
- Live preview mode — fully playable game from canvas config
- JSON export (to demonstrate engine compatibility)
- Publish flow with visibility controls
- Shareable link / challenge a friend CTA
- Community Games section in Explore tab

### Out of Scope for V1
- Multiplayer for community games
- Per-game leaderboards
- Monetisation
- Custom KenKen cage drawing
- Backend / auth (prototype only)

---

## 8. User Flows

### Flow 1: First-time creator discovers the feature

```
Home screen
  → Bottom nav: "Create" tab (new, pencil icon)
  → Empty state screen
      "Build a game. Challenge the world."
      [Start Building] CTA
  → Builder canvas (empty)
```

---

### Flow 2: Building a game

```
Builder canvas (empty)
  → User sees Component Tray at bottom
  → Drags "Equation Box" onto canvas
      → Component placed on canvas with default config
  → Taps placed component
      → Config Panel slides up (bottom sheet)
          Generator tab:
            Operand 1 range: [1] to [50]
            Operand 2 range: [1] to [50]
            Operations: [+] [-] [×] [÷] (multi-select toggle)
            Blank: [Left operand] [Right operand] [Result]
          Style tab:
            Background: 4 colour swatches from Matiks palette
            Text size: S / M / L
      → User sets range 2–12, operation ×, blank = Result
      → Taps Done → sheet dismisses
  → Drags "Timer" onto canvas
      → Config: 5s / 10s / 15s / 30s selector
  → Drags "Answer Input" onto canvas
      → Config: Validator type (exact match / range / multiple choice)
  → Taps gear icon (top right) → Global Settings sheet
      Game name: [Speed Tables]
      Rounds: 5 / 10 / 15 / 20
      Time limit: Per question / Per game / None
      Difficulty: Easy / Medium / Hard / Custom
  → Taps [Preview]
```

---

### Flow 3: Preview mode

```
Preview screen (full screen, identical to live Matiks game UI)
  → Game plays exactly as a real player would experience it
  → After final round: results screen
      Correct: 8/10
      Avg time: 4.2s
      [Publish this game] CTA
      [Back to builder] CTA
  → If user taps [Back to builder]:
      → Canvas restored with all config intact
      → Can continue editing
```

---

### Flow 4: Publish flow

```
Publish screen (3 steps)

Step 1 — Name and tag
  Game name: [Speed Tables]
  Category: Arithmetic / Logic / Speed / Memory
  Difficulty: Easy / Medium / Hard
  [Next]

Step 2 — Visibility
  Who can play?
  ● Anyone on Matiks
  ○ Only people with my link
  ○ Only my friends
  [Publish]

Step 3 — Confirmation
  ✓ Game published!
  [Share Link]  [Challenge a Friend]  [Play Now]
  [View in Community Games]
```

---

### Flow 5: Player discovers and plays a community game

```
Explore tab
  → New section: "Community Games"
  → Filter bar: All / Arithmetic / Logic / Speed / Memory
  → Trending grid (game cards)
      Card shows: game name, creator handle, avg rating ★, play count, difficulty badge
  → Taps a card
      → Game preview screen (same as daily challenge format)
          Game name large, creator handle, date created
          [Play Now] CTA
  → Plays game
  → Results screen
      [Rate this game] (1–5 stars)
      [Share] [Play Again] [Back to Community]
```

---

## 9. Components

### 9.1 Component Tray

Four components in V1, matching Matiks' existing visual language:

| Component | Visual | What it renders | Key config |
|-----------|--------|----------------|-----------|
| Equation Box | Green tile with operator | Generated equation with a blank | Operand ranges, operations, blank position |
| Timer | Clock badge (top right, like in app) | Countdown | Duration: 5 / 10 / 15 / 30s |
| Answer Input | Dark pill at bottom, "Enter Answer" placeholder | Keyboard entry field | Validator: exact match, range, multiple choice |
| Number Display | Single number tile | A generated number | Range, integer / decimal toggle |

### 9.2 Config Panel — Generator Tab

Controls how question content is generated each round. All values randomised fresh per round within the defined ranges.

**Equation Box generator config:**
```
Operand 1 range:   min [__] max [__]
Operand 2 range:   min [__] max [__]
Operations:        [+] [-] [×] [÷]  (multi-select)
Blank position:    [Left] [Right] [Result]
```

**Number Display generator config:**
```
Range:             min [__] max [__]
Type:              [Integer] [Decimal]
Decimal places:    [1] [2]
```

### 9.3 Config Panel — Validator Tab

Controls how the player's answer is evaluated.

| Validator type | When to use | Config |
|---------------|-------------|--------|
| Exact match | Arithmetic with a single correct answer | No extra config needed |
| Range match | Estimation or approximation games | Acceptable margin: ± [__] |
| Multiple choice | Lower difficulty, younger players | Number of options: 2 / 3 / 4 |

---

## 10. Global Game Settings

Accessible from the gear icon in the builder toolbar.

| Setting | Options |
|---------|---------|
| Game name | Free text, max 40 chars |
| Number of rounds | 5 / 10 / 15 / 20 |
| Time mode | Per question / Per game / None |
| Time limit | 5s / 10s / 15s / 30s / 1min / 2min |
| Difficulty tag | Easy / Medium / Hard / Custom |
| Category | Arithmetic / Logic / Speed / Memory |

---

## 11. Screens Summary

| Screen | Description |
|--------|-------------|
| Create tab entry | Empty state with CTA, or "My Games" list if creator has published before |
| Builder canvas | Main creation surface with component tray, toolbar, placed components |
| Config panel (bottom sheet) | Slides up when any component is tapped. Two tabs: Generator, Validator |
| Global settings sheet | Game-level config: name, rounds, time, difficulty |
| Preview mode | Full-screen playable game, identical UX to real Matiks game |
| Post-preview results | Score summary + Publish / Back to builder CTA |
| Publish flow | 3-step: name+tag → visibility → confirmation |
| Share confirmation | Link copy + challenge a friend + play now |
| Community Games (Explore) | Filter bar + game cards grid + trending section |
| Game card | Name, creator, rating, plays, difficulty badge |
| Game preview screen | Like daily challenge preview: game name, [Play Now] |
| Post-play rating | Star rating + share + back to community |

---

## 12. The Data Model

A published game is a single JSON config object. It is structurally identical to a first-party Matiks game config. The existing game engine runs it without modification.

```json
{
  "game_id": "ugc_a3f9c2",
  "creator": {
    "user_id": "u_12345",
    "username": "arjun_cm"
  },
  "meta": {
    "name": "Speed Tables",
    "category": "arithmetic",
    "difficulty": "medium",
    "visibility": "public",
    "created_at": "2026-06-09T18:00:00Z"
  },
  "config": {
    "rounds": 10,
    "time_limit": {
      "type": "per_question",
      "seconds": 10
    },
    "components": [
      {
        "type": "equation_box",
        "position": 1,
        "generator": {
          "operand_1": { "min": 2, "max": 12 },
          "operand_2": { "min": 2, "max": 12 },
          "operations": ["multiply"],
          "blank": "result"
        }
      },
      {
        "type": "answer_input",
        "position": 2,
        "validator": {
          "type": "exact_match"
        }
      },
      {
        "type": "timer",
        "position": 3,
        "duration_seconds": 10
      }
    ]
  }
}
```

The key architectural insight: this JSON is not new infrastructure. Every game Matiks already ships is a config like this. The builder just exposes the config authoring layer to users through a friendly UI.

---

## 13. Moderation (V1)

Lightweight automated validation before publish:

| Check | Rule |
|-------|------|
| Completable | Must have at least one Answer Input or Multiple Choice component |
| Generates content | Must have at least one Equation Box or Number Display |
| Sane ranges | min < max, max ≤ 100,000, no division by zero configs |
| Name filter | Basic profanity check on game name |

Games that pass are published immediately. Matiks team can remove flagged content post-hoc via an internal flag system.

---

## 14. Discovery — Where Community Games Live

New section in the existing Explore tab, below the daily challenges grid.

**Section header:** "Community Games" with a filter bar (All / Arithmetic / Logic / Speed / Memory)

**Two rows visible on scroll:**
- Trending (most played this week)
- New This Week

**Game card contains:**
- Game name (bold, white)
- Creator handle (muted, small)
- Average star rating
- Play count
- Difficulty badge (colour-coded: green Easy, yellow Medium, red Hard)

---

## 15. Success Metrics

| Metric | Target (30 days post-launch) |
|--------|------------------------------|
| Games created | 500+ |
| Games published | 300+ |
| Community game plays | 5,000+ |
| Creator retention (2+ games made) | 25% |
| Avg community game rating | ≥ 3.8 / 5 |
| Share link CTR | ≥ 15% |

---

## 16. What the Prototype Demonstrates

The React web prototype covers:

1. The drag-and-drop canvas (component placement, reorder, delete)
2. Config bottom sheet for each component (generator + validator settings)
3. Live equation generation from config (real randomised math problems)
4. Fully playable preview mode (answer checking, round progression, timer)
5. JSON export — the exact config that would feed into the Matiks game engine

It does not implement: publish flow, community discovery, moderation, or auth. Those require backend. The prototype proves the builder UX is intuitive and the config model is sound.

---

## 17. Build Plan (2-Day Prototype Sprint)

### Day 1 — Canvas and Config
- React project setup with @dnd-kit/core for drag and drop
- Component tray with 3 components: Equation Box, Answer Input, Timer
- Canvas drop zone with placed component rendering
- Config bottom sheet for each component
- Global settings panel

### Day 2 — Logic and Preview
- Wire generator: equation box produces real randomised equations from config values
- Answer validation logic (exact match working end to end)
- Preview mode: full game loop (round counter, timer countdown, answer checking, results)
- JSON export button showing the config
- UI polish: dark background (#0D0D0D), green (#4ADE80) and yellow (#FACC15) accents matching Matiks exactly

### LinkedIn post after demo:
"Matiks asked me in an intro call how I'd build a user game creator. I went home and built it. Here's a working demo and the data model underneath."

