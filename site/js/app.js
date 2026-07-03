/* UI: lesson rendering, SQLBolt-style interactive console, task checking, progress.
 *
 * Console model (layout copied from sqlbolt.com):
 *  - one full-width exercise band: results table + editor on the left,
 *    tasks panel + continue button on the right
 *  - the editor executes on Run ▶, Cmd/Ctrl+Enter, or when it loses focus —
 *    always against a FRESH copy of the database, so tasks are independent
 *    and nothing persists between runs
 *  - the table tabs preview a table in the .datatable without touching the
 *    editor; running a query replaces the preview with the query's result
 */

/* ------------------------------------------------ progress (localStorage) */

const PROGRESS_KEY = "cs348-progress";

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch (e) { return {}; }
}
function taskDone(lessonId, idx) {
  const p = getProgress();
  return !!(p[lessonId] && p[lessonId][idx]);
}
function setTaskDone(lessonId, idx) {
  const p = getProgress();
  if (!p[lessonId]) p[lessonId] = [];
  p[lessonId][idx] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

/* --------------------------------------------------------------- helpers */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const SQL_KEYWORDS = ("select|distinct|from|where|and|or|not|in|exists|union|except|intersect|all|some|any|" +
  "with|as|group|by|having|order|limit|offset|insert|into|values|delete|update|set|create|drop|table|view|" +
  "assertion|trigger|primary|key|foreign|references|join|left|right|full|inner|outer|on|is|null|like|" +
  "count|sum|min|max|avg|asc|desc|cascade|restrict|grant|revoke|commit|rollback|begin|end|atomic|check|" +
  "alter|add|column|integer|smallint|decimal|float|char|varchar|date|time|after|for|each|row|when|role|" +
  "referencing|old|new|to|case|then|else|between").split("|");
const SQL_KW_RE = new RegExp("\\b(" + SQL_KEYWORDS.join("|") + ")\\b", "gi");

function highlightSqlIn(root) {
  root.querySelectorAll("pre.sql").forEach(pre => {
    pre.innerHTML = escapeHtml(pre.textContent).replace(SQL_KW_RE, m => '<span class="kw">' + m + "</span>");
  });
}

// Editor overlay highlighting (keywords blue, like SQLBolt's Ace editor).
function editorHighlight(text, mode) {
  let html = escapeHtml(text);
  if (mode === "ra") {
    html = html.replace(/[σπρ×∪−]|\b(sigma|pi|rho|union)\b|(?<![A-Za-z0-9_])x(?![A-Za-z0-9_])/gi,
      m => '<span class="kw">' + m + "</span>");
  } else {
    html = html.replace(SQL_KW_RE, m => '<span class="kw">' + m + "</span>");
    html = html.replace(/(--[^\n]*)/g, '<span class="cm">$1</span>');
  }
  return html + "\n"; // trailing newline keeps overlay height in sync with textarea
}

// Render a { columns, values } result as a SQLBolt-style table.
function renderResultTable(result) {
  const t = el("table", "rel");
  const head = el("tr");
  result.columns.forEach(c => {
    const td = el("td", "column_name", escapeHtml(c));
    head.appendChild(td);
  });
  t.appendChild(head);
  result.values.forEach(row => {
    const tr = el("tr");
    row.forEach(v => {
      tr.appendChild(el("td", v === null ? "null" : null, v === null ? "null" : escapeHtml(v)));
    });
    t.appendChild(tr);
  });
  return t;
}

/* ------------------------------------------------------------ index page */

function initIndexPage() {
  const holder = document.getElementById("lesson-index");
  if (!holder) return;
  const progress = getProgress();
  let currentPart = null, ul = null;
  LESSONS.forEach(lesson => {
    if (lesson.part !== currentPart) {
      currentPart = lesson.part;
      holder.appendChild(el("h2", null, escapeHtml(lesson.part)));
      ul = el("ul", "lesson-list");
      holder.appendChild(ul);
    }
    const li = el("li");
    li.appendChild(el("span", "num", "Lesson " + lesson.id));
    const a = el("a", null, escapeHtml(lesson.title));
    a.href = "lesson.html?id=" + lesson.id;
    li.appendChild(a);
    const done = (progress[lesson.id] || []).filter(Boolean).length;
    const total = lesson.tasks.length;
    li.appendChild(el("span", "prog" + (done >= total ? " full" : ""),
      done >= total ? "✓ complete" : (done > 0 ? done + "/" + total : "")));
    ul.appendChild(li);
  });
}

/* ----------------------------------------------------------- lesson page */

let LESSON = null;
let SQLLIB = null;
let EXPECTED = [];

function lessonSetupSql(lesson) {
  return lesson.setup === "uri" ? SETUP_URI : null;
}

function initLessonPage() {
  const holder = document.getElementById("lesson-root");
  if (!holder) return;
  const id = parseInt(new URLSearchParams(location.search).get("id") || "1", 10);
  LESSON = LESSONS.find(l => l.id === id) || LESSONS[0];
  document.title = "CS348Bolt - Lesson " + LESSON.id + ": " + LESSON.title;

  holder.appendChild(el("p", "part-label", escapeHtml(LESSON.part)));
  holder.appendChild(el("h1", "lesson-title", "Lesson " + LESSON.id + ": " + escapeHtml(LESSON.title)));

  const prose = el("div", "prose", LESSON.html);
  holder.appendChild(prose);
  highlightSqlIn(prose);

  if (LESSON.type === "reading") renderQuiz(holder);
  else if (LESSON.type === "ra") renderConsole(holder, "ra");
  else renderConsole(holder, "sql");

  renderFooterNav(holder);
}

// SQLBolt-style footer: "Next - ..." / "Previous - ..." links.
function renderFooterNav(holder) {
  const nav = el("div", "footer-nav");
  const links = el("div", "links");
  const next = LESSONS.find(l => l.id === LESSON.id + 1);
  const prev = LESSONS.find(l => l.id === LESSON.id - 1);
  if (next) {
    links.appendChild(el("div", null,
      'Next - <a href="lesson.html?id=' + next.id + '">Lesson ' + next.id + ": " + escapeHtml(next.title) + "</a>"));
  } else {
    links.appendChild(el("div", null, 'Next - <a href="index.html">Back to the lesson list</a>'));
  }
  if (prev) {
    links.appendChild(el("div", null,
      'Previous - <a href="lesson.html?id=' + prev.id + '">Lesson ' + prev.id + ": " + escapeHtml(prev.title) + "</a>"));
  } else {
    links.appendChild(el("div", null, 'Previous - <a href="index.html">Lesson list</a>'));
  }
  nav.appendChild(links);
  nav.appendChild(el("div", "credit", "Built from the CS 348 lecture handouts,<br>in the style of sqlbolt.com."));
  holder.appendChild(nav);
}

/* ----------------------------------------------- VS Code editor shortcuts */

const INDENT = "  ";

function lineRange(text, start, end) {
  const ls = text.lastIndexOf("\n", start - 1) + 1;
  let le = text.indexOf("\n", end);
  if (le === -1) le = text.length;
  return [ls, le];
}

function editLines(ta, fn) {
  const { value, selectionStart: s, selectionEnd: e } = ta;
  const [ls, le] = lineRange(value, s, e);
  const lines = value.slice(ls, le).split("\n");
  const out = lines.map(fn);
  const deltaFirst = out[0].length - lines[0].length;
  const delta = out.join("\n").length - (le - ls);
  ta.value = value.slice(0, ls) + out.join("\n") + value.slice(le);
  ta.selectionStart = Math.max(ls, s + deltaFirst);
  ta.selectionEnd = e + delta;
}

function attachEditorKeys(ta, onChange, runNow) {
  ta.addEventListener("keydown", ev => {
    const mod = ev.metaKey || ev.ctrlKey;
    // Cmd/Ctrl+Enter: run immediately
    if (mod && ev.key === "Enter") { ev.preventDefault(); runNow(); return; }
    // Tab / Shift+Tab
    if (ev.key === "Tab" && !mod) {
      ev.preventDefault();
      if (!ev.shiftKey && ta.selectionStart === ta.selectionEnd) {
        const s = ta.selectionStart;
        ta.value = ta.value.slice(0, s) + INDENT + ta.value.slice(ta.selectionEnd);
        ta.selectionStart = ta.selectionEnd = s + INDENT.length;
      } else if (ev.shiftKey) {
        editLines(ta, l => l.replace(/^ {1,2}/, ""));
      } else {
        editLines(ta, l => INDENT + l);
      }
      onChange();
      return;
    }
    // Cmd/Ctrl+] and Cmd/Ctrl+[ : indent / outdent lines
    if (mod && (ev.key === "]" || ev.key === "[")) {
      ev.preventDefault();
      editLines(ta, ev.key === "]" ? (l => INDENT + l) : (l => l.replace(/^ {1,2}/, "")));
      onChange();
      return;
    }
    // Cmd/Ctrl+/ : toggle -- line comments
    if (mod && ev.key === "/") {
      ev.preventDefault();
      const { value, selectionStart: s, selectionEnd: e } = ta;
      const [ls, le] = lineRange(value, s, e);
      const lines = value.slice(ls, le).split("\n");
      const allCommented = lines.filter(l => l.trim()).every(l => /^\s*--/.test(l));
      editLines(ta, allCommented
        ? (l => l.replace(/^(\s*)--\s?/, "$1"))
        : (l => l.trim() ? "-- " + l : l));
      onChange();
      return;
    }
  });
}

/* ------------------------------------------- the SQLBolt exercise widget */

function renderConsole(holder, mode) {
  const rels = mode === "ra" ? (LESSON.raData === "bib" ? RA_BIB : RA_BANK) : null;

  // ---- exercise intro (prose column width) ----
  const intro = el("div", "exercise-intro");
  intro.appendChild(el("h2", "exercise-h", "Exercise"));
  intro.appendChild(el("p", null,
    (mode === "ra"
      ? "Solve the tasks in the panel — a task is checked off when your expression's result matches. Use the σ π ρ × ∪ − buttons or the ASCII spellings. "
      : (LESSON.dml
        ? "Your statement always runs against a fresh copy of the database, and the resulting state is checked against each task. "
        : "Solve the tasks in the panel — a task is checked off when your query's result matches. ")) +
    "Press <b>Run ▶</b> or <code>Cmd/Ctrl+Enter</code>; the editor also runs when it loses focus."));
  holder.appendChild(intro);

  // ---- the band ----
  const band = el("div", "exercise-band");
  const left = el("div", "table-and-input");
  const right = el("div", "tasks-panel");
  band.appendChild(left);
  band.appendChild(right);
  holder.appendChild(band);

  // Left: label with table tabs, datatable, editor
  const label = el("div", "table-label");
  left.appendChild(label);
  const datatable = el("div", "datatable");
  left.appendChild(datatable);

  const editorWrap = el("div", "editor-wrap");
  if (mode === "ra") {
    const bar = el("div", "ra-toolbar");
    ["σ", "π", "ρ", "×", "∪", "−"].forEach(sym => {
      const b = el("button", null, sym);
      b.type = "button";
      b.tabIndex = -1;
      b.addEventListener("mousedown", ev => {
        ev.preventDefault();
        const s = ta.selectionStart, e = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + sym + ta.value.slice(e);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = s + sym.length;
        markDirty();
      });
      bar.appendChild(b);
    });
    left.appendChild(bar);
  }
  const hl = el("pre", "editor-hl");
  const ta = document.createElement("textarea");
  ta.className = "editor";
  ta.spellcheck = false;
  ta.setAttribute("autocapitalize", "off");
  ta.setAttribute("autocomplete", "off");
  ta.title = "Runs on Run ▶, Cmd/Ctrl+Enter, or when the editor loses focus. Tab / Shift+Tab indent, Cmd/Ctrl+[ ], Cmd/Ctrl+/ comment";
  const runBtn = el("button", "runbtn", "Run ▶");
  runBtn.type = "button";
  const reset = el("a", "reset", "RESET");
  reset.href = "#";
  editorWrap.appendChild(hl);
  editorWrap.appendChild(ta);
  left.appendChild(editorWrap);
  // buttons live in their own bar below the editor so they never cover text
  const editorBar = el("div", "editor-bar");
  editorBar.appendChild(runBtn);
  editorBar.appendChild(reset);
  left.appendChild(editorBar);

  // Right: tasks
  right.appendChild(el("div", "tasks-title",
    "Exercise " + LESSON.id + ' — <span class="t">Tasks</span>'));
  const list = el("ol", "tasks");
  LESSON.tasks.forEach((t, i) => {
    const li = el("li");
    li.title = "Click to show/hide this task's solution";
    li.appendChild(el("span", "tx", escapeHtml(t.prompt)));
    li.appendChild(el("span", "check", " ✓"));
    li.addEventListener("click", () => toggleSolution(i));
    list.appendChild(li);
  });
  right.appendChild(list);
  const stuck = el("div", "stuck",
    'Stuck? Read this task\'s <a href="#" class="sol-link">Solution</a> — or click any task to see its solution.<br>Solve all tasks to complete the lesson.');
  right.appendChild(stuck);
  const solBox = el("pre", "sol-box");
  solBox.style.display = "none";
  right.appendChild(solBox);

  function showSolution(i, solved) {
    const t = LESSON.tasks[i];
    solBox.textContent = "-- Task " + (i + 1) + (solved ? " solved ✓" : "") + "\n" +
      (t.hint ? "-- " + t.hint + "\n" : "") + t.solution;
    solBox.style.display = "block";
    solBox.dataset.showing = i;
  }
  function toggleSolution(i) {
    if (solBox.style.display !== "none" && parseInt(solBox.dataset.showing, 10) === i) {
      solBox.style.display = "none";
    } else {
      showSolution(i, taskDone(LESSON.id, i));
    }
  }

  const next = LESSONS.find(l => l.id === LESSON.id + 1);
  const cont = el("a", "continue disabled", "Finish above Tasks");
  cont.href = next ? "lesson.html?id=" + next.id : "index.html";
  band.appendChild(cont);

  // ---- state & rendering ----
  const setup = mode === "sql" ? lessonSetupSql(LESSON) : null;
  const tables = mode === "ra" ? Object.keys(rels) : (LESSON.showTables || []);
  const starter = LESSON.starter ||
    (mode === "ra" ? tables[0] : "SELECT * FROM " + (tables[0] || "author") + ";");
  const tableViews = {}; // precomputed "select * from t" per table, for tab previews
  let dirty = true;      // editor text changed since the last execution

  function markDirty() { syncHl(); dirty = true; }

  // Tabs preview a table in the datatable WITHOUT touching the editor.
  function renderLabel(activeTable) {
    label.innerHTML = "";
    label.appendChild(el("span", null, tables.length > 1 ? "Tables: " : "Table: "));
    tables.forEach(t => {
      const a = el("a", "ttab" + (activeTable === t ? " active" : ""), escapeHtml(t.toUpperCase()));
      a.href = "#";
      // mousedown + preventDefault: don't steal focus (no blur-run on tab click)
      a.addEventListener("mousedown", ev => ev.preventDefault());
      a.addEventListener("click", ev => {
        ev.preventDefault();
        displayTable(t);
      });
      label.appendChild(a);
    });
  }

  function displayTable(t) {
    renderLabel(t);
    showResult(tableViews[t]);
  }

  function showResult(result) {
    datatable.innerHTML = "";
    if (result && result.columns) {
      datatable.appendChild(renderResultTable(result));
      datatable.appendChild(el("div", "rowcount", result.values.length + " record(s) selected."));
    } else {
      datatable.appendChild(el("div", "dt-msg", "The SQL command completed successfully."));
    }
  }

  function showError(err) {
    datatable.innerHTML = "";
    datatable.appendChild(el("div", "dt-error", "Query Error: " + escapeHtml(err.message || String(err))));
  }

  function refreshTasks() {
    let current = -1;
    LESSON.tasks.forEach((t, i) => {
      const li = list.children[i];
      const done = taskDone(LESSON.id, i);
      li.classList.toggle("done", done);
      if (!done && current === -1) current = i;
    });
    [...list.children].forEach((li, i) => li.classList.toggle("active", i === current));
    const allDone = current === -1;
    cont.classList.toggle("disabled", !allDone);
    cont.textContent = allDone
      ? (next ? "Continue to next lesson" : "All lessons complete!")
      : "Finish above Tasks";
    solBox.dataset.task = allDone ? LESSON.tasks.length - 1 : current;
  }

  stuck.querySelector(".sol-link").addEventListener("click", ev => {
    ev.preventDefault();
    toggleSolution(parseInt(solBox.dataset.task, 10));
  });

  function syncHl() {
    hl.innerHTML = editorHighlight(ta.value, mode);
    hl.scrollTop = ta.scrollTop;
  }
  ta.addEventListener("scroll", () => { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; });

  // ---- execution ----
  function computeExpected() {
    if (mode === "ra") {
      EXPECTED = LESSON.tasks.map(t => raRun(t.solution, rels));
      tables.forEach(t => { tableViews[t] = { columns: rels[t].attrs, values: rels[t].rows }; });
    } else {
      EXPECTED = LESSON.tasks.map(t => {
        const db = freshDb(SQLLIB, setup);
        db.run(t.solution);
        const res = t.verify ? sqlQuery(db, t.verify) : sqlQuery(db, t.solution);
        db.close();
        return res;
      });
      const db = freshDb(SQLLIB, setup);
      tables.forEach(t => { tableViews[t] = sqlQuery(db, "select * from " + t); });
      db.close();
    }
  }

  function execute(src) {
    dirty = false;
    renderLabel(null);
    if (!src.trim()) { datatable.innerHTML = ""; return; }
    const newlyDone = [];
    if (mode === "ra") {
      let result;
      try { result = raRun(src, rels); }
      catch (e) { showError(e); return; }
      showResult(result);
      LESSON.tasks.forEach((t, i) => {
        if (!taskDone(LESSON.id, i) && resultsEqual(result, EXPECTED[i], {})) {
          setTaskDone(LESSON.id, i);
          newlyDone.push(i);
        }
      });
    } else {
      const db = freshDb(SQLLIB, setup);
      let result;
      try { result = sqlExec(db, src); }
      catch (e) { showError(e); db.close(); return; }
      const isQuery = /^\s*(select|with|values)/i.test(src);
      if (result || isQuery) {
        showResult(result || { columns: [], values: [] });
      } else {
        // DML/DDL: show the new state of the (last) table or view the statement touched
        const re = /(?:insert\s+into|update|delete\s+from|create\s+table|create\s+view|alter\s+table)\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
        let touched = null, m;
        while ((m = re.exec(src)) !== null) touched = m[1];
        let state = null;
        if (touched) {
          try { state = sqlQuery(db, "select * from " + touched); } catch (e) { state = null; }
        }
        if (state) {
          datatable.innerHTML = "";
          datatable.appendChild(el("div", "dt-msg",
            "The SQL command completed successfully — <b>" + escapeHtml(touched.toUpperCase()) + "</b> is now:"));
          datatable.appendChild(renderResultTable(state));
          datatable.appendChild(el("div", "rowcount", state.values.length + " record(s)."));
        } else {
          showResult(null);
        }
      }
      LESSON.tasks.forEach((t, i) => {
        if (taskDone(LESSON.id, i)) return;
        let ok = false;
        try {
          ok = LESSON.dml
            ? resultsEqual(sqlQuery(db, t.verify), EXPECTED[i], { ordered: t.ordered, checkColumns: t.checkColumns })
            : resultsEqual(result, EXPECTED[i], { ordered: t.ordered, checkColumns: t.checkColumns });
        } catch (e) { ok = false; }
        if (ok) {
          setTaskDone(LESSON.id, i);
          newlyDone.push(i);
        }
      });
      db.close();
    }
    refreshTasks();
    // completing a task reveals its model solution
    if (newlyDone.length > 0) showSolution(newlyDone[newlyDone.length - 1], true);
  }

  function runNow() {
    syncHl();
    execute(ta.value);
  }

  ta.addEventListener("input", markDirty);
  ta.addEventListener("blur", () => { if (dirty && ta.value.trim()) runNow(); });
  attachEditorKeys(ta, markDirty, runNow);
  // mousedown + preventDefault keeps focus in the editor (no separate blur-run)
  runBtn.addEventListener("mousedown", ev => { ev.preventDefault(); runNow(); });
  reset.addEventListener("mousedown", ev => ev.preventDefault());
  reset.addEventListener("click", ev => {
    ev.preventDefault();
    ta.value = starter;
    markDirty();
    displayTable(tables[0]);
    ta.focus();
  });

  // ---- boot ----
  function boot() {
    computeExpected();
    ta.value = starter;
    syncHl();
    refreshTasks();
    displayTable(tables[0]);
  }

  if (mode === "ra") {
    boot();
  } else {
    datatable.appendChild(el("div", "dt-msg", "Loading SQL engine…"));
    loadSQL().then(SQL => { SQLLIB = SQL; boot(); })
      .catch(e => {
        datatable.innerHTML = "";
        datatable.appendChild(el("div", "dt-error",
          "Could not load the SQL engine (sql.js from CDN). Are you online? " + escapeHtml(e.message || e)));
      });
  }
}

/* ----------------------------------------------------------- quiz lesson */

function renderQuiz(holder) {
  holder.appendChild(el("h2", "exercise-h", "Check your understanding"));
  LESSON.tasks.forEach((task, i) => {
    const q = el("div", "quiz-q");
    q.appendChild(el("div", "qtext", (i + 1) + ". " + escapeHtml(task.prompt)));
    const name = "q" + LESSON.id + "_" + i;
    task.choices.forEach((choice, ci) => {
      const labelEl = el("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = ci;
      labelEl.appendChild(input);
      labelEl.appendChild(document.createTextNode(" " + choice));
      q.appendChild(labelEl);
    });
    const fb = el("div", "feedback");
    if (taskDone(LESSON.id, i)) { fb.className = "feedback right"; fb.textContent = "✓ Correct"; }
    const btn = el("button", null, "Check");
    btn.addEventListener("click", () => {
      const sel = q.querySelector("input:checked");
      if (!sel) return;
      if (parseInt(sel.value, 10) === task.answer) {
        fb.className = "feedback right";
        fb.textContent = "✓ Correct";
        setTaskDone(LESSON.id, i);
      } else {
        fb.className = "feedback wrong";
        fb.textContent = "✗ Not quite — try again.";
      }
    });
    q.appendChild(btn);
    q.appendChild(fb);
    holder.appendChild(q);
  });
}

/* ------------------------------------------------------------------ init */

document.addEventListener("DOMContentLoaded", () => {
  initIndexPage();
  initLessonPage();
});
