# PRD: Matiks Game Builder
**Feature:** User-Generated Game Creation  
**Author:** Mridul Tiwari (Concept Prototype)  
**Version:** 1.0  
**Status:** Concept / Demo

---

## 1. Problem Statement

Every game on Matiks today is built by the Matiks team. The community of power users, teachers, competitive math enthusiasts, and creators has no way to contribute. This is a missed flywheel: the people most invested in the platform are also the most capable of creating compelling challenges for others.

A game builder unlocks user-generated content, increases content velocity without increasing engineering cost, and deepens community ownership of the platform.

---

## 2. Goal

Let any Matiks user design, publish, and share a playable math game using the same core components and logic primitives that Matiks already uses internally, without writing any code.

The end output of a user-created game is a **JSON config** that slots directly into Matiks' existing game engine. No new runtime. No new evaluation logic. Just a new way to author configs.

---

## 3. Core Insight: What a Matiks Game Actually Is

Every Matiks game, at its core, is three things:

| Layer | What it does | Example |
|---|---|---|
| **Component** | What the player sees and interacts with | A number grid, equation box, answer input |
| **Generator** | How the question/numbers are produced | Two random integers 1–100, operation: multiply |
| **Validator** | How correctness is checked | Exact match, range match, multiple choice |

The builder exposes all three layers through a visual, no-code interface. A user-created game is simply a JSON config that describes these three layers, and the existing Matiks game engine plays it exactly like any other game.

---

## 4. User Stories

- As a **math teacher**, I want to create a custom multiplication drill for my students and share a link so they can practice on Matiks.
- As a **power user**, I want to design a novel puzzle format and challenge my friends to beat my high score on it.
- As a **community member**, I want to browse and play games created by other users.
- As the **Matiks team**, I want to increase content volume without proportionally increasing engineering effort.

---

## 5. Feature Scope (MVP for Prototype)

### In Scope
- Canvas-based game builder (web, React)
- Draggable components: Number Box, Equation Box, Answer Input, Timer
- Generator config panel: number range, operations, quantity
- Validator config panel: exact match, multiple choice (2–4 options)
- Live preview: play the game as you build it
- Export to JSON
- "Publish" flow: gives a shareable game ID/link

### Out of Scope (V1)
- Multiplayer/duel mode for user-created games (V2)
- Leaderboards per user-created game (V2)
- Monetisation / creator rewards (V3)
- Complex puzzle types like KenKen or CrossMath grids (V2)

---

## 6. The Builder: Screen by Screen

### 6.1 Entry Point
A new tab in the Matiks bottom nav: **"Create"**  
Icon: a pencil inside a game controller.  
Tagline on empty state: *"Build a game. Challenge the world."*

---

### 6.2 The Canvas (Main Builder Screen)

```
┌─────────────────────────────────────────┐
│  [← Back]   My Game      [Preview] [Publish] │
├─────────────────────────────────────────┤
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │   CANVAS AREA     │           │
│         │  (drop components │           │
│         │   here)           │           │
│         │                   │           │
│         └───────────────────┘           │
│                                         │
├─────────────────────────────────────────┤
│  COMPONENT TRAY                         │
│  [Number Box] [Equation Box] [Timer]    │
│  [Answer Input] [Multiple Choice]       │
└─────────────────────────────────────────┘
```

- User drags a component from the tray onto the canvas
- Tapping a placed component opens its **Config Panel** from the bottom (a bottom sheet, native to mobile)
- Canvas supports reorder, delete, resize (fixed sizes, not freeform)

---

### 6.3 Component Tray

Five components in V1:

| Component | What it renders | Configurable properties |
|---|---|---|
| **Number Box** | Displays a generated number | Range (min/max), integer or decimal |
| **Equation Box** | Displays a full equation with a blank | Operands range, operation (+, -, ×, ÷), blank position (left/right/result) |
| **Timer** | Countdown clock | Duration (5s / 10s / 15s / 30s) |
| **Answer Input** | Keyboard input field | Numeric only, max digits |
| **Multiple Choice** | 2–4 tap-to-select buttons | Number of options, distractor generation strategy |

---

### 6.4 Config Panel (Bottom Sheet)

Opens when any placed component is tapped. Two tabs:

**Generate tab:** Controls how the content of this component is produced.

Example for Equation Box:
```
Operand 1 range:   [1] to [100]
Operand 2 range:   [1] to [100]
Operation:         [+] [-] [×] [÷]   (multi-select)
Blank:             [ Left ] [Right] [Result]
```

**Style tab:** (Simple, V1 only)
- Background colour: pick from Matiks' existing palette (4 options)
- Text size: Small / Medium / Large

---

### 6.5 Game Config Panel (Global Settings)

Accessible via a settings icon in the top bar.

```
Game Name:         [________________]
Number of rounds:  [5] [10] [15] [20]
Time limit:        Per question / Per game / None
Difficulty tag:    Easy / Medium / Hard / Custom
```

---

### 6.6 Preview Mode

A full-screen playable simulation of the game, exactly as a player would experience it.

- "You" play the game yourself to test it
- After completing, shows: avg time per question, correct %, and a prompt: *"Happy with it? Publish."*
- Back button returns to the canvas with all config intact

---

### 6.7 Publish Flow

Three screens:

**Screen 1: Name and tag**
```
Name your game:     [_________________]
Category:           [ Arithmetic ] [ Logic ] [ Speed ] [ Memory ]
Difficulty:         [ Easy ] [ Medium ] [ Hard ]
```

**Screen 2: Share settings**
```
Who can play?
  ● Anyone on Matiks
  ○ Only people with the link
  ○ Only my friends
```

**Screen 3: Confirmation**
```
✓ Game published!

[Share Link]   [Challenge a Friend]   [Play Now]
```

---

## 7. The Data Model

A published game is a single JSON object stored in the Matiks game config database. It is structurally identical to a first-party Matiks game config, with an added `creator` field.

```json
{
  "game_id": "ugc_a3f9c2",
  "creator": {
    "user_id": "u_12345",
    "username": "mridul_cm"
  },
  "meta": {
    "name": "Speedy Multiplications",
    "category": "arithmetic",
    "difficulty": "medium",
    "visibility": "public"
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

This JSON is passed directly to the existing Matiks game engine. The engine does not know or care whether it was authored by the Matiks team or a user.

---

## 8. Moderation

User-generated games go through a lightweight automated check before publishing:

- Config must have at least one Answer Input or Multiple Choice component (must be completable)
- Config must have at least one Generator component (must produce a question)
- Number ranges must be sane (min < max, max < 100,000)
- Game name: basic profanity filter

Games that pass are published immediately. Matiks team can remove flagged games post-hoc.

---

## 9. Discovery: Where User Games Live

New section in the Explore tab: **"Community Games"**

```
┌─────────────────────────────────────────┐
│  Community Games              [Filter ▾] │
├─────────────────────────────────────────┤
│  🔥 Trending                            │
│  ┌──────────┐  ┌──────────┐            │
│  │ Speed ×  │  │ Decimal  │            │
│  │ by @ravi │  │ by @priya│            │
│  │ ★ 4.8   │  │ ★ 4.5   │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  🆕 New This Week                       │
│  ...                                    │
└─────────────────────────────────────────┘
```

Each game card shows: name, creator handle, average rating, play count, difficulty tag.

---

## 10. Success Metrics

| Metric | Target (30 days post-launch) |
|---|---|
| Games created | 500+ |
| Games published (passed moderation) | 300+ |
| Community game plays | 5,000+ |
| Creator retention (created 2+ games) | 25% |
| Average rating of community games | > 3.8 / 5 |

---

## 11. What This Prototype Demonstrates

This prototype is a React web implementation of the builder canvas and preview flow. It demonstrates:

1. The drag-and-drop component composition model
2. The config panel for each component type
3. Live preview: the game is actually playable
4. JSON export: shows the exact config that would be fed to the Matiks game engine

It does not implement the publish flow, discovery, or moderation (backend concerns). The goal is to prove the builder UX is intuitive and the JSON model is sound.

---

## 12. Build Plan (for the prototype)

**Day 1**
- Set up React project
- Build canvas with drag-and-drop (use `react-dnd` or `@dnd-kit/core`)
- Build component tray with 3 components: Equation Box, Answer Input, Timer
- Build config bottom sheet for each component

**Day 2**
- Wire generator logic: equation box actually generates random equations from config
- Build Preview mode: fully playable game from canvas config
- Add JSON export button
- Polish UI to match Matiks' dark, high-contrast aesthetic

**LinkedIn post after:**  
*"Matiks asked me how I'd build a user game creator. I went home and built it. Here's the demo and how I thought about the data model underneath."*
