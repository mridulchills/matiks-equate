const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  black:      "0D0D0D",
  darkGray:   "1A1A1A",
  midGray:    "2C2C2C",
  lightGray:  "E8E8E8",
  white:      "FFFFFF",
  green:      "4ADE80",
  greenDark:  "16A34A",
  yellow:     "FACC15",
  muted:      "6B7280",
  accent:     "3B82F6",
  accentBg:   "EFF6FF",
  headerBg:   "111827",
  rowAlt:     "F9FAFB",
  rowHead:    "1F2937",
};

// ─── Border helpers ──────────────────────────────────────────────────────────
const noBorder  = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" };
const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: "4ADE80" };
const allThin   = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const allNone   = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ─── Text helpers ────────────────────────────────────────────────────────────
const run = (text, opts = {}) => new TextRun({ text, font: "Arial", ...opts });
const bold = (text, opts = {}) => run(text, { bold: true, ...opts });
const code = (text) => new TextRun({ text, font: "Courier New", size: 18, color: C.greenDark });

// ─── Paragraph helpers ───────────────────────────────────────────────────────
const spacer = (pts = 120) => new Paragraph({
  children: [run("")],
  spacing: { before: pts, after: 0 }
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: C.black })],
  spacing: { before: 400, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.green, space: 4 } }
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: C.black })],
  spacing: { before: 300, after: 120 }
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: "374151" })],
  spacing: { before: 220, after: 80 }
});

const body = (text, opts = {}) => new Paragraph({
  children: [run(text, { size: 22, ...opts })],
  spacing: { before: 60, after: 80 },
  ...opts.paraOpts
});

const bullet = (text, ref = "bullets") => new Paragraph({
  numbering: { reference: ref, level: 0 },
  children: [run(text, { size: 22 })],
  spacing: { before: 40, after: 40 }
});

const bulletBold = (label, rest, ref = "bullets") => new Paragraph({
  numbering: { reference: ref, level: 0 },
  children: [bold(label, { size: 22 }), run(rest, { size: 22 })],
  spacing: { before: 40, after: 40 }
});

// ─── Table helpers ───────────────────────────────────────────────────────────
const cell = (children, opts = {}) => new TableCell({
  borders: allThin,
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  shading: opts.shading || undefined,
  width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
  children: Array.isArray(children) ? children : [
    new Paragraph({
      children: Array.isArray(children.runs) ? children.runs : [
        new TextRun({ text: typeof children === "string" ? children : "", font: "Arial", size: 20, ...opts.textOpts })
      ],
      spacing: { before: 40, after: 40 },
      alignment: opts.alignment
    })
  ]
});

const headerCell = (text, width) => cell(text, {
  width,
  shading: { fill: C.rowHead, type: ShadingType.CLEAR },
  textOpts: { bold: true, color: C.white }
});

const makeTable = (colWidths, rows) => new Table({
  width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: colWidths,
  rows
});

// ─── Callout box (shaded paragraph) ─────────────────────────────────────────
const callout = (label, text, color = C.accentBg) => [
  new Paragraph({
    children: [
      bold(`${label}  `, { size: 20, color: "1D4ED8" }),
      run(text, { size: 20, color: "1E3A5F" })
    ],
    spacing: { before: 100, after: 100 },
    indent: { left: 360, right: 360 },
    shading: { fill: color, type: ShadingType.CLEAR },
    border: {
      left: { style: BorderStyle.SINGLE, size: 20, color: C.accent, space: 4 }
    }
  }),
  spacer(60)
];

// ─── Code block ──────────────────────────────────────────────────────────────
const codeBlock = (lines) => [
  new Paragraph({
    children: [],
    spacing: { before: 60, after: 0 },
    shading: { fill: "F3F4F6", type: ShadingType.CLEAR }
  }),
  ...lines.map(line => new Paragraph({
    children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "1F2937" })],
    spacing: { before: 0, after: 0 },
    indent: { left: 360, right: 360 },
    shading: { fill: "F3F4F6", type: ShadingType.CLEAR }
  })),
  new Paragraph({
    children: [],
    spacing: { before: 0, after: 80 },
    shading: { fill: "F3F4F6", type: ShadingType.CLEAR }
  })
];

// ─── Cover page ──────────────────────────────────────────────────────────────
const coverPage = [
  spacer(800),
  new Paragraph({
    children: [new TextRun({ text: "MATIKS", font: "Arial", size: 72, bold: true, color: C.green })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "Game Builder", font: "Arial", size: 52, bold: true, color: C.black })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "Product Requirements Document", font: "Arial", size: 28, color: C.muted })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 }
  }),
  spacer(200),
  // meta table
  makeTable([2200, 4000], [
    new TableRow({ children: [
      headerCell("Feature", 2200),
      cell("User-Generated Game Creation ("Create" Mode)", { width: 4000 })
    ]}),
    new TableRow({ children: [
      headerCell("Prepared by", 2200),
      cell("Mridul Tiwari", { width: 4000 })
    ]}),
    new TableRow({ children: [
      headerCell("Version", 2200),
      cell("3.0 — Layout/Logic Separation Model", { width: 4000 })
    ]}),
    new TableRow({ children: [
      headerCell("Status", 2200),
      cell("Concept Prototype — Interview Demo", { width: 4000 })
    ]}),
    new TableRow({ children: [
      headerCell("Date", 2200),
      cell("June 2026", { width: 4000 })
    ]}),
  ]),
  new Paragraph({ children: [new PageBreak()] })
];

// ─── Section 1: Background ───────────────────────────────────────────────────
const section1 = [
  h1("1. Background"),
  body("Every game on Matiks today — Cross Math, Math Maze, KenKen, Sudoku, arithmetic drills — is authored by the Matiks team. The platform has two categories of content: Puzzles (4 daily) and Maths (2 daily). Both reset every 24 hours and are identical for every player."),
  body("This means content velocity is entirely bottlenecked by internal engineering capacity. There is no mechanism for teachers, power users, or community members to contribute."),
  body("The Game Builder changes this. It lets any user design a playable Matiks game using the same visual primitives the app already uses, publish it with a shareable link, and contribute to a growing library of community-created content."),
  spacer(60),
  ...callout("Key Architecture Insight", "The output of every user-created game is a structured JSON config — structurally identical to a first-party Matiks game config. The existing game engine runs it without modification. The Builder is a new authoring surface, not a new execution engine."),
];

// ─── Section 2: Problem Statement ────────────────────────────────────────────
const section2 = [
  h1("2. Problem Statement"),
  h2("For Creators"),
  body("There is no way to express a game idea on Matiks. Teachers who want custom drills, competitive players who invent new formats, and community members who want to challenge friends — all have nowhere to go."),
  h2("For Matiks"),
  body("Content volume is capped by internal bandwidth. User-generated content is the only path to scale without proportionally scaling engineering. It deepens platform stickiness: creators have a reason to return and promote their games."),
  h2("The Design Challenge"),
  body("Letting non-technical users create game logic without writing code is genuinely hard. The Make 24 example perfectly stress-tests any approach: it requires a creator to express four random number boxes, three operator input dropdowns between them, and a validation rule that evaluates whether the expression equals 24."),
  body("That last part — expressing evaluation logic — is where every previous 'no-code game builder' idea collapses."),
];

// ─── Section 3: Why This Approach ────────────────────────────────────────────
const section3 = [
  h1("3. Why Layout / Logic Separation"),
  body("This PRD adopts the Layout + Rule Sheet model. To understand why, here is an honest comparison of the three approaches considered:"),
  spacer(80),
  makeTable([2200, 3200, 2800], [
    new TableRow({ children: [
      headerCell("Approach", 2200),
      headerCell("How it works", 3200),
      headerCell("Why rejected / chosen", 2800)
    ]}),
    new TableRow({ children: [
      cell("Template Builder", { width: 2200, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Users configure parameters on pre-built game templates. No custom logic.", { width: 3200, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Rejected. Users are configuring, not creating. Game variety is bounded by what Matiks ships.", { width: 2800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
    new TableRow({ children: [
      cell("Visual Node Graph", { width: 2200 }),
      cell("Canvas + node wiring. Users drag components and connect logic visually like a flow graph.", { width: 3200 }),
      cell("Rejected for V1. Essentially a visual programming language. Collapses when non-technical users must express evaluation rules.", { width: 2800 })
    ]}),
    new TableRow({ children: [
      cell("Layout + Rule Sheet ✓", { width: 2200, shading: { fill: "F0FDF4", type: ShadingType.CLEAR } }),
      cell("Canvas for player-facing layout. Separate structured Rule Sheet for game logic. Two surfaces, each simple.", { width: 3200, shading: { fill: "F0FDF4", type: ShadingType.CLEAR } }),
      cell("Chosen. Covers 90% of creative math game ideas. Each surface stays intuitive. Articulable design decision.", { width: 2800, shading: { fill: "F0FDF4", type: ShadingType.CLEAR } })
    ]}),
  ]),
  spacer(120),
  h2("The Core Insight"),
  body("Layout (what the player sees) and Logic (what the game evaluates) are two fundamentally different concerns. Conflating them on one canvas forces non-technical users to mentally model execution flow while also designing visual layout. Separating them lets each surface remain intuitive."),
  ...callout("Interview-ready framing:", "\"I separated layout from logic intentionally. A freeform canvas collapses when users need to express evaluation rules. The Rule Sheet gives creators expressive power without requiring them to understand node graphs or write code.\""),
];

// ─── Section 4: Goals ────────────────────────────────────────────────────────
const section4 = [
  h1("4. Goals"),
  bullet("Let users build a fully playable Matiks game without writing code"),
  bullet("Reuse existing game component primitives (equation boxes, number tiles, timers, answer inputs)"),
  bullet("Keep output compatible with the existing game engine (JSON config)"),
  bullet("Express complex game logic — including multi-operand expression evaluation — through a structured Rule Sheet, not code"),
  bullet("Make sharing frictionless: one-tap shareable link or friend challenge"),
  bullet("Keep the builder UI consistent with Matiks dark, high-contrast aesthetic"),
  spacer(100),
  h1("5. Non-Goals (V1)"),
  bullet("Multiplayer / live duel mode for user-created games (V2)"),
  bullet("Per-game leaderboards for community games (V2)"),
  bullet("Creator monetisation or reward system (V3)"),
  bullet("Complex custom grid-layout editors like KenKen cage drawing (V2)"),
  bullet("Node graph / visual logic wiring (long-term V2+ vision)"),
  bullet("Backend infrastructure — this prototype covers frontend only"),
];

// ─── Section 5: Personas ─────────────────────────────────────────────────────
const section5 = [
  h1("6. User Personas"),
  spacer(60),
  makeTable([1800, 2800, 2800], [
    new TableRow({ children: [
      headerCell("Persona", 1800),
      headerCell("Context", 2800),
      headerCell("What they need from the Builder", 2800)
    ]}),
    new TableRow({ children: [
      cell("The Teacher\nPriya, Grade 6 Pune", { width: 1800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Uses Matiks in her classroom. Not technical. Wants custom multiplication drills tuned to her syllabus.", { width: 2800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Builder as intuitive as Google Forms. No programming concepts. Clear preview before publish.", { width: 2800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
    new TableRow({ children: [
      cell("The Power User\nArjun, top-500 globally", { width: 1800 }),
      cell("Has invented a mental math format in his head. Wants to build it and challenge friends.", { width: 2800 }),
      cell("Expressive enough to encode non-trivial game logic. Rule Sheet must handle multi-step expressions.", { width: 2800 })
    ]}),
    new TableRow({ children: [
      cell("The Casual Creator\nSneha, daily commute player", { width: 1800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Wants to send a custom math puzzle to her sister as a birthday challenge.", { width: 2800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Frictionless share link. Doesn't care about publishing publicly. Needs under 5-minute build flow.", { width: 2800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
  ]),
];

// ─── Section 6: User Stories ─────────────────────────────────────────────────
const section6 = [
  h1("7. User Stories"),
  spacer(60),
  makeTable([800, 1400, 3000, 2200], [
    new TableRow({ children: [
      headerCell("ID", 800),
      headerCell("As a...", 1400),
      headerCell("I want to...", 3000),
      headerCell("So that...", 2200)
    ]}),
    ...[
      ["US-01","Teacher","Create a custom arithmetic drill with specific number ranges","My students practice exactly what we covered in class"],
      ["US-02","Power user","Design a multi-operand expression game using the Rule Sheet","I can encode logic like 'make this expression equal 24'"],
      ["US-03","Casual creator","Build a quick math challenge and share a link","I can send it to someone without them needing to find it on the app"],
      ["US-04","Any creator","Preview my game before publishing","I can catch broken configs before others play it"],
      ["US-05","Any user","Browse and play games made by the community","I can discover new formats beyond the daily challenges"],
      ["US-06","Any creator","See how many people have played my game","I can feel rewarded for creating something people enjoy"],
      ["US-07","Teacher","Set a time limit and difficulty tag","Students and parents know what to expect"],
      ["US-08","Any creator","Edit my published game","I can fix mistakes after publishing"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 800, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 1400, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[2], { width: 3000, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[3], { width: 2200, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
];

// ─── Section 7: Core UX Model ─────────────────────────────────────────────────
const section7 = [
  h1("8. Core UX Model — Two Surfaces"),
  body("The builder is split into two panels that work together. Neither is complex in isolation."),
  spacer(80),
  makeTable([4500, 4500], [
    new TableRow({ children: [
      headerCell("Left Panel — Layout Canvas", 4500),
      headerCell("Right Panel — Rule Sheet", 4500)
    ]}),
    new TableRow({ children: [
      cell("What the player sees. A drag-and-drop canvas where creators place visual components: Number Tiles, Operator Inputs, Target Displays, Answer Inputs, Timers.", { width: 4500 }),
      cell("What the game evaluates. A structured form — not a canvas, not code — where creators define input sources, the expression structure, and the win condition.", { width: 4500 })
    ]}),
    new TableRow({ children: [
      cell("Components auto-register to the Rule Sheet when placed. Drop a Number Tile → it appears as an available variable (A, B, C...) in the Rule Sheet.", { width: 4500, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Rule Sheet has three structured sections: Input Definitions, Expression Builder, Win Condition. Each is a simple form, not a programming interface.", { width: 4500, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
  ]),
  spacer(120),
  h2("Make 24 — Walked Through"),
  body("Make 24 is the showcase example because it is the hardest case the builder must support. If Make 24 can be built without code, simpler games are obviously possible."),
  spacer(80),
  h3("Step 1 — Layout Canvas"),
  bullet("Drag 4 Number Tiles onto canvas → auto-labelled A, B, C, D"),
  bullet("Drag 3 Operator Inputs between them"),
  bullet("Drag a Target Display → set to show \"= 24\""),
  bullet("Drag a Submit Button"),
  spacer(60),
  h3("Step 2 — Rule Sheet (auto-populated from canvas)"),
  spacer(40),
  ...codeBlock([
    "INPUT DEFINITIONS",
    "  A: random integer, range 1–9",
    "  B: random integer, range 1–9",
    "  C: random integer, range 1–9",
    "  D: random integer, range 1–9",
    "",
    "PLAYER CONTROLS",
    "  op1: operator selector  (+  −  ×  ÷)",
    "  op2: operator selector  (+  −  ×  ÷)",
    "  op3: operator selector  (+  −  ×  ÷)",
    "",
    "EXPRESSION",
    "  A  [op1]  B  [op2]  C  [op3]  D",
    "",
    "WIN CONDITION",
    "  expression  equals  24"
  ]),
  spacer(60),
  h3("Step 3 — Preview"),
  body("One tap. The canvas layout becomes the live game. The Rule Sheet becomes the engine. Round counter, timer, answer evaluation, results screen — identical to a real Matiks game."),
  ...callout("Why this matters:", "A non-technical teacher can build Make 24 in under 3 minutes without touching a single line of code or understanding what 'evaluate expression' means. The Rule Sheet abstracts that entirely."),
];

// ─── Section 8: Components ────────────────────────────────────────────────────
const section8 = [
  h1("9. Components"),
  h2("9.1 Component Tray"),
  body("Six components in V1. Each auto-registers to the Rule Sheet when placed on canvas."),
  spacer(60),
  makeTable([1600, 1600, 2400, 3000], [
    new TableRow({ children: [
      headerCell("Component", 1600),
      headerCell("Visual", 1600),
      headerCell("What it renders", 2400),
      headerCell("Auto-registers as", 3000)
    ]}),
    ...[
      ["Number Tile","Green tile with number","A generated number per round","Input variable (A, B, C...) in Rule Sheet"],
      ["Operator Input","Pill with +−×÷ selector","Player's operator choice","Control variable (op1, op2...) in Expression"],
      ["Target Display","Bold display tile","Static or computed target value","Referenced in Win Condition"],
      ["Answer Input","Dark pill, 'Enter Answer'","Keyboard entry for direct-answer games","Validator endpoint in Rule Sheet"],
      ["Timer","Clock badge","Countdown per question or per game","Global game setting"],
      ["Submit Button","CTA button","Triggers expression evaluation","Wired to Win Condition evaluation"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 1600, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 1600, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[2], { width: 2400, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[3], { width: 3000, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
  spacer(120),
  h2("9.2 Component Config Panel"),
  body("Each component has a config panel (bottom sheet on tap). Config is split into two tabs:"),
  spacer(60),
  makeTable([2000, 3400, 4000], [
    new TableRow({ children: [
      headerCell("Component", 2000),
      headerCell("Generator Tab", 3400),
      headerCell("Validator Tab", 4000)
    ]}),
    new TableRow({ children: [
      cell("Number Tile", { width: 2000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Range min/max. Integer or decimal. Decimal places.", { width: 3400, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("N/A — Number Tiles feed into the Rule Sheet expression, not directly validated", { width: 4000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
    new TableRow({ children: [
      cell("Equation Box", { width: 2000 }),
      cell("Operand 1 range, Operand 2 range, Operations (multi-select), Blank position", { width: 3400 }),
      cell("Exact match / Range match / Multiple choice", { width: 4000 })
    ]}),
    new TableRow({ children: [
      cell("Answer Input", { width: 2000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("N/A", { width: 3400, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Exact match, Range match (± margin), Multiple choice (2/3/4 options)", { width: 4000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
    new TableRow({ children: [
      cell("Timer", { width: 2000 }),
      cell("Duration: 5s / 10s / 15s / 30s / 1min", { width: 3400 }),
      cell("N/A", { width: 4000 })
    ]}),
  ]),
  spacer(120),
  h2("9.3 Rule Sheet — Three Sections"),
  spacer(60),
  makeTable([1800, 3000, 4000], [
    new TableRow({ children: [
      headerCell("Section", 1800),
      headerCell("What it defines", 3000),
      headerCell("UI", 4000)
    ]}),
    new TableRow({ children: [
      cell("Input Definitions", { width: 1800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("What each Number Tile or Equation Box generates per round", { width: 3000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Auto-populated from canvas. Each row: variable label, type (random int / random decimal / static), range.", { width: 4000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
    new TableRow({ children: [
      cell("Expression Builder", { width: 1800 }),
      cell("How inputs and controls combine into an evaluatable expression", { width: 3000 }),
      cell("Drag slots to order variables and operator controls. Visual: [A] [op1] [B] [op2] [C]...", { width: 4000 })
    ]}),
    new TableRow({ children: [
      cell("Win Condition", { width: 1800, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("How the game decides if the player succeeded", { width: 3000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } }),
      cell("Dropdown: expression equals [value] / less than / greater than / closest to [value] among all players", { width: 4000, shading: { fill: C.rowAlt, type: ShadingType.CLEAR } })
    ]}),
  ]),
];

// ─── Section 9: User Flows ────────────────────────────────────────────────────
const section9 = [
  h1("10. User Flows"),
  h2("Flow 1 — First-time Creator"),
  ...codeBlock([
    "Home screen",
    "  → Bottom nav: 'Create' tab (pencil icon)",
    "  → Empty state: 'Build a game. Challenge the world.'",
    "      [Start Building] CTA",
    "  → Split-panel builder (canvas left, Rule Sheet right)"
  ]),
  h2("Flow 2 — Building Make 24"),
  ...codeBlock([
    "Builder canvas (empty)",
    "  → User drags 'Number Tile' × 4 onto canvas",
    "      → Rule Sheet auto-populates: A, B, C, D as input rows",
    "  → User drags 'Operator Input' × 3 between number tiles",
    "      → Rule Sheet: op1, op2, op3 appear in Expression Builder",
    "  → User drags 'Target Display' → sets value to 24",
    "  → User drags 'Submit Button'",
    "  → Configures each Number Tile: range 1–9, integer",
    "  → Rule Sheet: Expression = A [op1] B [op2] C [op3] D",
    "  → Rule Sheet: Win Condition = expression equals 24",
    "  → [Preview]"
  ]),
  h2("Flow 3 — Preview Mode"),
  ...codeBlock([
    "Preview screen (full screen, identical to live Matiks game UI)",
    "  → Game plays exactly as a real player would experience",
    "  → After final round: results screen",
    "      Correct: 8/10  |  Avg time: 4.2s",
    "      [Publish this game]  [Back to builder]",
    "  → Back to builder → canvas and Rule Sheet intact"
  ]),
  h2("Flow 4 — Publish"),
  ...codeBlock([
    "Step 1 — Name and tag",
    "  Game name: [Make 24]",
    "  Category: Arithmetic / Logic / Speed / Memory",
    "  Difficulty: Easy / Medium / Hard",
    "  [Next]",
    "",
    "Step 2 — Visibility",
    "  ● Anyone on Matiks",
    "  ○ Only people with my link",
    "  ○ Only my friends",
    "  [Publish]",
    "",
    "Step 3 — Confirmation",
    "  ✓ Game published!",
    "  [Share Link]  [Challenge a Friend]  [Play Now]",
    "  [View in Community Games]"
  ]),
];

// ─── Section 10: Data Model ───────────────────────────────────────────────────
const section10 = [
  h1("11. Data Model"),
  body("A published game is a single JSON config object. Structurally identical to a first-party Matiks game config. The existing engine runs it without modification."),
  spacer(60),
  ...codeBlock([
    "{",
    '  "game_id": "ugc_a3f9c2",',
    '  "creator": { "user_id": "u_12345", "username": "arjun_cm" },',
    '  "meta": {',
    '    "name": "Make 24",',
    '    "category": "arithmetic",',
    '    "difficulty": "hard",',
    '    "visibility": "public",',
    '    "created_at": "2026-06-09T18:00:00Z"',
    '  },',
    '  "config": {',
    '    "rounds": 5,',
    '    "time_limit": { "type": "per_round", "seconds": 30 },',
    '    "layout": {',
    '      "components": [',
    '        { "id": "A", "type": "number_tile", "position": 1 },',
    '        { "id": "op1", "type": "operator_input", "position": 2 },',
    '        { "id": "B", "type": "number_tile", "position": 3 },',
    '        { "id": "op2", "type": "operator_input", "position": 4 },',
    '        { "id": "C", "type": "number_tile", "position": 5 },',
    '        { "id": "op3", "type": "operator_input", "position": 6 },',
    '        { "id": "D", "type": "number_tile", "position": 7 },',
    '        { "id": "target", "type": "target_display", "value": 24 },',
    '        { "id": "submit", "type": "submit_button" }',
    '      ]',
    '    },',
    '    "rule_sheet": {',
    '      "inputs": {',
    '        "A": { "type": "random_int", "min": 1, "max": 9 },',
    '        "B": { "type": "random_int", "min": 1, "max": 9 },',
    '        "C": { "type": "random_int", "min": 1, "max": 9 },',
    '        "D": { "type": "random_int", "min": 1, "max": 9 }',
    '      },',
    '      "expression": "A op1 B op2 C op3 D",',
    '      "win_condition": { "type": "equals", "target": 24 }',
    '    }',
    '  }',
    "}",
  ]),
  ...callout("Architecture note:", "The 'layout' key describes what the player sees. The 'rule_sheet' key describes what the engine evaluates. This maps exactly to the two-surface UX model — same separation in the data model as in the builder interface."),
];

// ─── Section 11: Global Settings ─────────────────────────────────────────────
const section11 = [
  h1("12. Global Game Settings"),
  spacer(60),
  makeTable([2800, 4600], [
    new TableRow({ children: [headerCell("Setting", 2800), headerCell("Options", 4600)] }),
    ...[
      ["Game name","Free text, max 40 chars"],
      ["Number of rounds","5 / 10 / 15 / 20"],
      ["Time mode","Per question / Per game / None"],
      ["Time limit","5s / 10s / 15s / 30s / 1 min / 2 min"],
      ["Difficulty tag","Easy / Medium / Hard / Custom"],
      ["Category","Arithmetic / Logic / Speed / Memory"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 2800, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 4600, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
];

// ─── Section 12: Screens Summary ─────────────────────────────────────────────
const section12 = [
  h1("13. Screens Summary"),
  spacer(60),
  makeTable([2800, 6600], [
    new TableRow({ children: [headerCell("Screen", 2800), headerCell("Description", 6600)] }),
    ...[
      ["Create tab entry","Empty state with CTA, or 'My Games' list if creator has published before"],
      ["Builder canvas (left panel)","Main creation surface with component tray, toolbar, placed components"],
      ["Rule Sheet (right panel)","Structured form: Input Definitions, Expression Builder, Win Condition"],
      ["Config panel (bottom sheet)","Slides up when any component is tapped. Two tabs: Generator, Validator"],
      ["Global settings sheet","Game-level config: name, rounds, time, difficulty"],
      ["Preview mode","Full-screen playable game, identical UX to real Matiks game"],
      ["Post-preview results","Score summary + Publish / Back to builder CTA"],
      ["Publish flow","3-step: name+tag → visibility → confirmation"],
      ["Share confirmation","Link copy + challenge a friend + play now"],
      ["Community Games (Explore)","Filter bar + game cards grid + trending section"],
      ["Game card","Name, creator, rating, plays, difficulty badge"],
      ["Post-play rating","Star rating + share + back to community"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 2800, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 6600, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
];

// ─── Section 13: Moderation ───────────────────────────────────────────────────
const section13 = [
  h1("14. Moderation (V1)"),
  body("Lightweight automated validation before publish. Games that pass are published immediately."),
  spacer(60),
  makeTable([2800, 6600], [
    new TableRow({ children: [headerCell("Check", 2800), headerCell("Rule", 6600)] }),
    ...[
      ["Completable","Must have at least one Answer Input, Submit Button, or Multiple Choice component"],
      ["Generates content","Must have at least one Number Tile or Equation Box"],
      ["Valid Rule Sheet","Expression must reference at least one input variable. Win Condition must be set."],
      ["Sane ranges","min < max, max ≤ 100,000, no division by zero configs"],
      ["Name filter","Basic profanity check on game name"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 2800, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 6600, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
];

// ─── Section 14: Metrics ─────────────────────────────────────────────────────
const section14 = [
  h1("15. Success Metrics"),
  spacer(60),
  makeTable([4000, 5400], [
    new TableRow({ children: [headerCell("Metric", 4000), headerCell("Target (30 days post-launch)", 5400)] }),
    ...[
      ["Games created","500+"],
      ["Games published","300+"],
      ["Community game plays","5,000+"],
      ["Creator retention (2+ games made)","25%"],
      ["Avg community game rating","≥ 3.8 / 5"],
      ["Share link CTR","≥ 15%"],
      ["Median game build time (first game)","≤ 8 minutes"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 4000, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 5400, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
];

// ─── Section 15: Build Plan ───────────────────────────────────────────────────
const section15 = [
  h1("16. Build Plan — 2-Day Prototype Sprint"),
  h2("Day 1 — Canvas + Rule Sheet"),
  bullet("React project setup with @dnd-kit/core for drag and drop"),
  bullet("Component tray with 6 components"),
  bullet("Canvas drop zone with placed component rendering"),
  bullet("Rule Sheet panel: Input Definitions auto-populate from canvas drops"),
  bullet("Expression Builder UI: draggable slots for variables and operator controls"),
  bullet("Win Condition dropdown"),
  bullet("Config bottom sheet per component (generator + validator tabs)"),
  bullet("Global settings panel"),
  spacer(80),
  h2("Day 2 — Logic + Preview + Polish"),
  bullet("Wire generator: Number Tiles produce real randomised values from config ranges"),
  bullet("Expression evaluator: parse expression string with operator inputs and evaluate"),
  bullet("Preview mode: full game loop (round counter, timer countdown, win condition check, results)"),
  bullet("JSON export button showing the config that would feed the real engine"),
  bullet("UI polish: dark background (#0D0D0D), green (#4ADE80) and yellow (#FACC15) accents matching Matiks exactly"),
  bullet("Make 24 pre-loaded as demo game — CTO sees it working immediately"),
  spacer(120),
  h2("What the Prototype Demonstrates"),
  spacer(60),
  makeTable([3200, 6200], [
    new TableRow({ children: [headerCell("Capability", 3200), headerCell("How demonstrated", 6200)] }),
    ...[
      ["Layout / Logic separation","Two-panel builder — each panel independently simple"],
      ["Make 24 build flow","Live demo: build Make 24 from scratch in under 3 minutes"],
      ["Real randomised math","Number Tiles generate fresh values each round from Rule Sheet config"],
      ["Expression evaluation","Multi-operand expression with player operator choices evaluates correctly"],
      ["Preview mode","Full playable game loop from canvas config — identical to Matiks game UX"],
      ["JSON export","The exact config that would feed the existing Matiks game engine"],
    ].map((r, i) => new TableRow({
      children: [
        cell(r[0], { width: 3200, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
        cell(r[1], { width: 6200, shading: i%2===0 ? { fill: C.rowAlt, type: ShadingType.CLEAR } : undefined }),
      ]
    }))
  ]),
  spacer(120),
  ...callout("LinkedIn post angle:", "\"Matiks' CTO asked me how I'd design a user game creator in an intro call. I went home and thought about what actually breaks these features: non-technical users can't express game logic visually. So I separated layout from logic. Built a working demo. Here's Make 24, built entirely by a non-coder in the builder.\""),
];

// ─── Discovery section ────────────────────────────────────────────────────────
const section16 = [
  h1("17. Discovery — Community Games"),
  body("New section in the existing Explore tab, below the daily challenges grid."),
  spacer(60),
  h2("Section layout"),
  bullet("Filter bar: All / Arithmetic / Logic / Speed / Memory"),
  bullet("Trending row: most played this week"),
  bullet("New This Week row"),
  spacer(60),
  h2("Game card contains"),
  bullet("Game name (bold, white)"),
  bullet("Creator handle (muted, small)"),
  bullet("Average star rating (1–5)"),
  bullet("Play count"),
  bullet("Difficulty badge: green Easy / yellow Medium / red Hard"),
];

// ─── Assemble document ───────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: C.black } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: C.black },
        paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: C.black },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "374151" },
        paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 2 }
      },
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "MATIKS GAME BUILDER  —  PRD v3.0", font: "Arial", size: 16, color: C.muted, bold: true }),
              new TextRun({ children: [new PageNumber()], font: "Arial", size: 16, color: C.muted }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB", space: 4 } },
            spacing: { after: 160 }
          })
        ]
      })
    },
    children: [
      ...coverPage,
      ...section1,
      ...section2,
      ...section3,
      ...section4,
      ...section5,
      ...section6,
      ...section7,
      ...section8,
      ...section9,
      ...section10,
      ...section11,
      ...section12,
      ...section13,
      ...section14,
      ...section15,
      ...section16,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/matiks_game_builder_prd_v3.docx", buffer);
  console.log("Done.");
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
