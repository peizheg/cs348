# CS348Bolt — Interactive lessons for Midterm 2

A SQLBolt-style tutorial site covering the three lecture handouts:

- **Part 1 (Lessons 1–12):** Module 3 — Basic SQL
- **Part 2 (Lessons 13–17):** Module 4 — Relational Algebra
- **Part 3 (Lessons 18–23):** Module 5 — Advanced SQL

Every lesson uses the lecture schemas (the bibliography database and the
ACCOUNT/BANK instance) on an extended data set: all slide rows are present,
plus extra authors, publications, accounts and banks, so exercises can't be
passed by accident and are pitched at midterm-prep difficulty. Example outputs
quoted in the prose show the small slide instance.

## Running

The SQL engine (sql.js, SQLite compiled to WebAssembly) must be fetched over
HTTP, so serve the folder instead of opening the files directly:

```sh
cd site
python3 -m http.server 8348
```

then open <http://localhost:8348/>. An internet connection is needed the first
time (sql.js loads from the cdnjs CDN).

## The console (SQLBolt format)

Each lesson ends in a SQLBolt-style exercise band: a scrollable results table
(sticky header) with table tabs that preview tables without touching your
query, an editor that executes on **Run ▶**, `Cmd/Ctrl+Enter`, or when it
loses focus (always against a fresh copy of the database, so tasks are
independent), and a tasks panel with a Solution link and a "Continue to next
lesson" button that unlocks when all tasks are done.

Editor shortcuts (VS Code style): `Tab` / `Shift+Tab` indent/outdent,
`Cmd/Ctrl+[` and `Cmd/Ctrl+]` change indentation, `Cmd/Ctrl+/` toggles `--`
comments, `Cmd/Ctrl+Enter` runs immediately. `RESET` restores the starter
query.

## How it works

- `js/lessons.js` — all lesson prose and tasks (with hidden solutions)
- `js/data.js` — the lecture datasets (SQL DDL + RA relations)
- `js/engine-sql.js` — sql.js wrapper + result comparison
- `js/engine-ra.js` — a small relational algebra parser/evaluator
  (σ, π, ρ, ×, ∪, −, constant relations; ASCII spellings `sigma`, `pi`,
  `rho`, `x`, `union`, `-` also accepted)
- `js/app.js` — lesson rendering, the exercise band, task checking, progress
  (progress is stored in the browser's localStorage)

Notes vs. the slides: SQLite doesn't accept parentheses around UNION/EXCEPT
operands, and doesn't support SOME/ALL, EXCEPT ALL, or CREATE ASSERTION —
the affected lessons say so inline and use equivalent forms.
