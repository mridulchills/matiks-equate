# MATIKS Game Builder
## Product Requirements Document (PRD) v3.0

### Document Metadata
| Metadata | Details |
| :--- | :--- |
| **Feature** | User-Generated Game Creation ("Create" Mode) |
| **Prepared by** | Mridul Tiwari |
| **Version** | 3.0 — Layout/Logic Separation Model |
| **Status** | Concept Prototype — Interview Demo |
| **Date** | June 2026 |

---

## 1. Background
Every game on Matiks today — Cross Math, Math Maze, KenKen, Sudoku, arithmetic drills — is authored by the Matiks team. The platform has two categories of content: Puzzles (4 daily) and Maths (2 daily). Both reset every 24 hours and are identical for every player.

This means content velocity is entirely bottlenecked by internal engineering capacity. There is no mechanism for teachers, power users, or community members to contribute.

The Game Builder changes this. It lets any user design a playable Matiks game using the same visual primitives the app already uses, publish it with a shareable link, and contribute to a growing library of community-created content.

> **Key Architecture Insight:** The output of every user-created game is a structured JSON config — structurally identical to a first-party Matiks game config. The existing game engine runs it without modification. The Builder is a new authoring surface, not a new execution engine.

---

## 2. Problem Statement
### For Creators
There is no way to express a game idea on Matiks. Teachers who want custom drills, competitive players who invent new formats, and community members who want to challenge friends — all have nowhere to go.

### For Matiks
Content volume is capped by internal bandwidth. User-generated content is the only path to scale without proportionally scaling engineering. It deepens platform stickiness: creators have a reason to return and promote their games.

### The Design Challenge
Letting non-technical users create game logic without writing code is genuinely hard. The Make 24 example perfectly stress-tests any approach: it requires a creator to express four random number boxes, three operator input dropdowns between them, and a validation rule that evaluates whether the expression equals 24.

That last part — expressing evaluation logic — is where every previous 'no-code game builder' idea collapses.

---

## 3. Why Layout / Logic Separation
This PRD adopts the Layout + Rule Sheet model. To understand why, here is an honest comparison of the three approaches considered:

| Approach | How it works | Why rejected / chosen |
| :--- | :--- | :--- |
| **Template Builder** | Users configure parameters on pre-built game templates. No custom logic. | Rejected. Users are configuring, not creating. Game variety is bounded by what Matiks ships. |
| **Visual Node Graph** | Canvas + node wiring. Users drag components and connect logic visually like a flow graph. | Rejected for V1. Essentially a visual programming language. Collapses when non-technical users must express evaluation rules. |
| **Layout + Rule Sheet ✓** | Canvas for player-facing layout. Separate structured Rule Sheet for game logic. Two surfaces, each simple. | **Chosen.** Covers 90% of creative math game ideas. Each surface stays intuitive. Articulable design decision. |

### The Core Insight
Layout (what the player sees) and Logic (what the game evaluates) are two fundamentally different concerns. Conflating them on one canvas forces non-technical users to mentally model execution flow while also designing visual layout. Separating them lets each surface remain intuitive.

> **Interview-ready framing:** "I separated layout from logic intentionally. A freeform canvas collapses when users need to express evaluation rules. The Rule Sheet gives creators expressive power without requiring them to understand node graphs or write code."

---

## 4. Goals
* Let users build a fully playable Matiks game without writing code
* Reuse existing game component primitives (equation boxes, number tiles, timers, answer inputs)
* Keep output compatible with the existing game engine (JSON config)
* Express complex game logic — including multi-operand expression evaluation — through a structured Rule Sheet, not code
* Make sharing frictionless: one-tap shareable link or friend challenge
* Keep the builder UI consistent with Matiks dark, high-contrast aesthetic

## 5. Non-Goals (V1)
* Multiplayer / live duel mode for user-created games (V2)
* Per-game leaderboards for community games (V2)
* Creator monetisation or reward system (V3)
* Complex custom grid-layout editors like KenKen cage drawing (V2)
* Node graph / visual logic wiring (long-term V2+ vision)
* Backend infrastructure — this prototype covers frontend only

---

## 6. User Personas

| Persona | Context | What they need from the Builder |
| :--- | :--- | :--- |
| **The Teacher**<br>Priya, Grade 6 Pune | Uses Matiks in her classroom. Not technical. Wants custom multiplication drills tuned to her syllabus. | Builder as intuitive as Google Forms. No programming concepts. Clear preview before publish. |
| **The Power User**<br>Arjun, top-500 globally | Has invented a mental math format in his head. Wants to build it and challenge friends. | Expressive enough to encode non-trivial game logic. Rule Sheet must handle multi-step expressions. |
| **The Casual Creator**<br>Sneha, daily commute player | Wants to send a custom math puzzle to her sister as a birthday challenge. | Frictionless share link. Doesn't care about publishing publicly. Needs under 5-minute build flow. |

---

## 7. User Stories

| ID | As a... | I want to... | So that... |
| :--- | :--- | :--- | :--- |
| **US-01** | Teacher | Create a custom arithmetic drill with specific number ranges | My students practice exactly what we covered in class |
| **US-02** | Power user | Design a multi-operand expression game using the Rule Sheet | I can encode logic like 'make this expression equal 24' |
| **US-03** | Casual creator | Build a quick math challenge and share a link | I can send it to someone without them needing to find it on the app |
| **US-04** | Any creator | Preview my game before publishing | I can catch broken configs before others play it |
| **US-05** | Any user | Browse and play games made by the community | I can discover new formats beyond the daily challenges |
| **US-06** | Any creator | See how many people have played my game | I can feel rewarded for creating something people enjoy |
| **US-07** | Teacher | Set a time limit and difficulty tag | Students and parents know what to expect |
| **US-08** | Any creator | Edit my published game | I can fix mistakes after publishing |

---

## 8. Core UX Model — Two Surfaces
The builder is split into two panels that work together. Neither is complex in isolation.

| Left Panel — Layout Canvas | Right Panel — Rule Sheet |
| :--- | :--- |
| What the player sees. A drag-and-drop canvas where creators place visual components: Number Tiles, Operator Inputs, Target Displays, Answer Inputs, Timers. | What the game evaluates. A structured form — not a canvas, not code — where creators define input sources, the expression structure, and the win condition. |
| Components auto-register to the Rule Sheet when placed. Drop a Number Tile → it appears as an available variable (A, B, C...) in the Rule Sheet. | Rule Sheet has three structured sections: Input Definitions, Expression Builder, Win Condition. Each is a simple form, not a programming interface. |

### Make 24 — Walked Through
Make 24 is the showcase example because it is the hardest case the builder must support. If Make 24 can be built without code, simpler games are obviously possible.

#### Step 1 — Layout Canvas
* Drag 4 Number Tiles onto canvas → auto-labelled A, B, C, D
* Drag 3 Operator Inputs between them
* Drag a Target Display → set to show "= 24"
* Drag a Submit Button

#### Step 2 — Rule Sheet (auto-populated from canvas)
```text
INPUT DEFINITIONS
  A: random integer, range 1–9
  B: random integer, range 1–9
  C: random integer, range 1–9
  D: random integer, range 1–9

PLAYER CONTROLS
  op1: operator selector  (+  −  ×  ÷)
  op2: operator selector  (+  −  ×  ÷)
  op3: operator selector  (+  −  ×  ÷)

EXPRESSION
  A  [op1]  B  [op2]  C  [op3]  D

WIN CONDITION
  expression  equals  24

```

#### Step 3 — Preview

One tap. The canvas layout becomes the live game. The Rule Sheet becomes the engine. Round counter, timer, answer evaluation, results screen — identical to a real Matiks game.

> **Why this matters:** A non-technical teacher can build Make 24 in under 3 minutes without touching a single line of code or understanding what 'evaluate expression' means. The Rule Sheet abstracts that entirely.

---

## 9. Components

### 9.1 Component Tray

Six components in V1. Each auto-registers to the Rule Sheet when placed on canvas.

| Component | Visual | What it renders | Auto-registers as |
| --- | --- | --- | --- |
| **Number Tile** | Green tile with number | A generated number per round | Input variable (A, B, C...) in Rule Sheet |
| **Operator Input** | Pill with +−×÷ selector | Player's operator choice | Control variable (op1, op2...) in Expression |
| **Target Display** | Bold display tile | Static or computed target value | Referenced in Win Condition |
| **Answer Input** | Dark pill, 'Enter Answer' | Keyboard entry for direct-answer games | Validator endpoint in Rule Sheet |
| **Timer** | Clock badge | Countdown per question or per game | Global game setting |
| **Submit Button** | CTA button | Triggers expression evaluation | Wired to Win Condition evaluation |

### 9.2 Component Config Panel

Each component has a config panel (bottom sheet on tap). Config is split into two tabs:

| Component | Generator Tab | Validator Tab |
| --- | --- | --- |
| **Number Tile** | Range min/max. Integer or decimal. Decimal places. | N/A — Number Tiles feed into the Rule Sheet expression, not directly validated |
| **Equation Box** | Operand 1 range, Operand 2 range, Operations (multi-select), Blank position | Exact match / Range match / Multiple choice |
| **Answer Input** | N/A | Exact match, Range match (± margin), Multiple choice (2/3/4 options) |
| **Timer** | Duration: 5s / 10s / 15s / 30s / 1min | N/A |

### 9.3 Rule Sheet — Three Sections

| Section | What it defines | UI |
| --- | --- | --- |
| **Input Definitions** | What each Number Tile or Equation Box generates per round | Auto-populated from canvas. Each row: variable label, type (random int / random decimal / static), range. |
| **Expression Builder** | How inputs and controls combine into an evaluatable expression | Drag slots to order variables and operator controls. Visual: [A] [op1] [B] [op2] [C]... |
| **Win Condition** | How the game decides if the player succeeded | Dropdown: expression equals [value] / less than / greater than / closest to [value] among all players |

---

## 10. User Flows

### Flow 1 — First-time Creator

```text
Home screen
  → Bottom nav: 'Create' tab (pencil icon)
  → Empty state: 'Build a game. Challenge the world.'
      [Start Building] CTA
  → Split-panel builder (canvas left, Rule Sheet right)

```

### Flow 2 — Building Make 24

```text
Builder canvas (empty)
  → User drags 'Number Tile' × 4 onto canvas
      → Rule Sheet auto-populates: A, B, C, D as input rows
  → User drags 'Operator Input' × 3 between number tiles
      → Rule Sheet: op1, op2, op3 appear in Expression Builder
  → User drags 'Target Display' → sets value to 24
  → User drags 'Submit Button'
  → Configures each Number Tile: range 1–9, integer
  → Rule Sheet: Expression = A [op1] B [op2] C [op3] D
  → Rule Sheet: Win Condition = expression equals 24
  → [Preview]

```

### Flow 3 — Preview Mode

```text
Preview screen (full screen, identical to live Matiks game UI)
  → Game plays exactly as a real player would experience
  → After final round: results screen
      Correct: 8/10  |  Avg time: 4.2s
      [Publish this game]  [Back to builder]
  → Back to builder → canvas and Rule Sheet intact

```

### Flow 4 — Publish

```text
Step 1 — Name and tag
  Game name: [Make 24]
  Category: Arithmetic / Logic / Speed / Memory
  Difficulty: Easy / Medium / Hard
  [Next]

Step 2 — Visibility
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

## 11. Data Model

A published game is a single JSON config object. Structurally identical to a first-party Matiks game config. The existing engine runs it without modification.

```json
{
  "game_id": "ugc_a3f9c2",
  "creator": { "user_id": "u_12345", "username": "arjun_cm" },
  "meta": {
    "name": "Make 24",
    "category": "arithmetic",
    "difficulty": "hard",
    "visibility": "public",
    "created_at": "2026-06-09T18:00:00Z"
  },
  "config": {
    "rounds": 5,
    "time_limit": { "type": "per_round", "seconds": 30 },
    "layout": {
      "components": [
        { "id": "A", "type": "number_tile", "position": 1 },
        { "id": "op1", "type": "operator_input", "position": 2 },
        { "id": "B", "type": "number_tile", "position": 3 },
        { "id": "op2", "type": "operator_input", "position": 4 },
        { "id": "C", "type": "number_tile", "position": 5 },
        { "id": "op3", "type": "operator_input", "position": 6 },
        { "id": "D", "type": "number_tile", "position": 7 },
        { "id": "target", "type": "target_display", "value": 24 },
        { "id": "submit", "type": "submit_button" }
      ]
    },
    "rule_sheet": {
      "inputs": {
        "A": { "type": "random_int", "min": 1, "max": 9 },
        "B": { "type": "random_int", "min": 1, "max": 9 },
        "C": { "type": "random_int", "min": 1, "max": 9 },
        "D": { "type": "random_int", "min": 1, "max": 9 }
      },
      "expression": "A op1 B op2 C op3 D",
      "win_condition": { "type": "equals", "target": 24 }
    }
  }
}

```

> **Architecture note:** The 'layout' key describes what the player sees. The 'rule_sheet' key describes what the engine evaluates. This maps exactly to the two-surface UX model — same separation in the data model as in the builder interface.

---

## 12. Global Game Settings

| Setting | Options |
| --- | --- |
| **Game name** | Free text, max 40 chars |
| **Number of rounds** | 5 / 10 / 15 / 20 |
| **Time mode** | Per question / Per game / None |
| **Time limit** | 5s / 10s / 15s / 30s / 1 min / 2 min |
| **Difficulty tag** | Easy / Medium / Hard / Custom |
| **Category** | Arithmetic / Logic / Speed / Memory |

---

## 13. Screens Summary

| Screen | Description |
| --- | --- |
| **Create tab entry** | Empty state with CTA, or 'My Games' list if creator has published before |
| **Builder canvas (left panel)** | Main creation surface with component tray, toolbar, placed components |
| **Rule Sheet (right panel)** | Structured form: Input Definitions, Expression Builder, Win Condition |
| **Config panel (bottom sheet)** | Slides up when any component is tapped. Two tabs: Generator, Validator |
| **Global settings sheet** | Game-level config: name, rounds, time, difficulty |
| **Preview mode** | Full-screen playable game, identical UX to real Matiks game |
| **Post-preview results** | Score summary + Publish / Back to builder CTA |
| **Publish flow** | 3-step: name+tag → visibility → confirmation |
| **Share confirmation** | Link copy + challenge a friend + play now |
| **Community Games (Explore)** | Filter bar + game cards grid + trending section |
| **Game card** | Name, creator, rating, plays, difficulty badge |
| **Post-play rating** | Star rating + share + back to community |

---

## 14. Moderation (V1)

Lightweight automated validation before publish. Games that pass are published immediately.

| Check | Rule |
| --- | --- |
| **Completable** | Must have at least one Answer Input, Submit Button, or Multiple Choice component |
| **Generates content** | Must have at least one Number Tile or Equation Box |
| **Valid Rule Sheet** | Expression must reference at least one input variable. Win Condition must be set. |
| **Sane ranges** | min < max, max ≤ 100,000, no division by zero configs |
| **Name filter** | Basic profanity check on game name |

---

## 15. Success Metrics

| Metric | Target (30 days post-launch) |
| --- | --- |
| **Games created** | 500+ |
| **Games published** | 300+ |
| **Community game plays** | 5,000+ |
| **Creator retention (2+ games made)** | 25% |
| **Avg community game rating** | ≥ 3.8 / 5 |
| **Share link CTR** | ≥ 15% |
| **Median game build time (first game)** | ≤ 8 minutes |

---

## 16. Build Plan — 2-Day Prototype Sprint

### Day 1 — Canvas + Rule Sheet

* React project setup with `@dnd-kit/core` for drag and drop
* Component tray with 6 components
* Canvas drop zone with placed component rendering
* Rule Sheet panel: Input Definitions auto-populate from canvas drops
* Expression Builder UI: draggable slots for variables and operator controls
* Win Condition dropdown
* Config bottom sheet per component (generator + validator tabs)
* Global settings panel

### Day 2 — Logic + Preview + Polish

* Wire generator: Number Tiles produce real randomised values from config ranges
* Expression evaluator: parse expression string with operator inputs and evaluate
* Preview mode: full game loop (round counter, timer countdown, win condition check, results)
* JSON export button showing the config that would feed the real engine
* UI polish: dark background (`#0D0D0D`), green (`#4ADE80`) and yellow (`#FACC15`) accents matching Matiks exactly
* Make 24 pre-loaded as demo game — CTO sees it working immediately

### What the Prototype Demonstrates

| Capability | How demonstrated |
| --- | --- |
| **Layout / Logic separation** | Two-panel builder — each panel independently simple |
| **Make 24 build flow** | Live demo: build Make 24 from scratch in under 3 minutes |
| **Real randomised math** | Number Tiles generate fresh values each round from Rule Sheet config |
| **Expression evaluation** | Multi-operand expression with player operator choices evaluates correctly |
| **Preview mode** | Full playable game loop from canvas config — identical to Matiks game UX |
| **JSON export** | The exact config that would feed the existing Matiks game engine |

> **LinkedIn post angle:** "Matiks' CTO asked me how I'd design a user game creator in an intro call. I went home and thought about what actually breaks these features: non-technical users can't express game logic visually. So I separated layout from logic. Built a working demo. Here's Make 24, built entirely by a non-coder in the builder."

---

## 17. Discovery — Community Games

New section in the existing Explore tab, below the daily challenges grid.

### Section layout

* Filter bar: All / Arithmetic / Logic / Speed / Memory
* Trending row: most played this week
* New This Week row

### Game card contains

* Game name (bold, white)
* Creator handle (muted, small)
* Average star rating (1–5)
* Play count
* Difficulty badge: green Easy / yellow Medium / red Hard

```