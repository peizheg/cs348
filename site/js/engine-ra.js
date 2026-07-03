/* A small relational algebra interpreter implementing the grammar from
 * Module 4, slide 9:
 *
 *   E ::= R                          relation name
 *       | A = c                      constant relation
 *       | sigma[A op B](E)           selection        (σ)
 *       | pi[A1,...,Ak](E)           projection       (π)
 *       | rho[A1,...,Ak](E)          rename           (ρ)
 *       | E x E                      cross product    (×)
 *       | E union E                  union            (∪)
 *       | E - E                      set difference   (−)
 *       | ( E )
 *
 * Both the Greek/math symbols and the ASCII keywords are accepted.
 * Relations are { attrs: [...], rows: [[...], ...] } with set semantics.
 */

const RA_SYMBOL_MAP = {
  "σ": "sigma",   // σ
  "π": "pi",      // π
  "ρ": "rho",     // ρ
  "×": "x",       // ×
  "∪": "union",   // ∪
  "−": "minus",   // −
  "-": "minus"
};

function raTokenize(src) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (RA_SYMBOL_MAP[c]) { toks.push({ t: RA_SYMBOL_MAP[c] }); i++; continue; }
    if ("[](),".indexOf(c) >= 0) { toks.push({ t: c }); i++; continue; }
    if (c === "!" && src[i + 1] === "=") { toks.push({ t: "op", v: "!=" }); i += 2; continue; }
    if (c === "≠") { toks.push({ t: "op", v: "!=" }); i++; continue; } // ≠
    if (c === "<") {
      if (src[i + 1] === "=") { toks.push({ t: "op", v: "<=" }); i += 2; }
      else if (src[i + 1] === ">") { toks.push({ t: "op", v: "!=" }); i += 2; }
      else { toks.push({ t: "op", v: "<" }); i++; }
      continue;
    }
    if (c === ">") {
      if (src[i + 1] === "=") { toks.push({ t: "op", v: ">=" }); i += 2; }
      else { toks.push({ t: "op", v: ">" }); i++; }
      continue;
    }
    if (c === "=") { toks.push({ t: "op", v: "=" }); i++; continue; }
    if (c === "$") {
      let j = i + 1;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      if (j === i + 1) throw new Error("Expected digits after '$'.");
      toks.push({ t: "lit", v: src.slice(i, j) });
      i = j; continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      toks.push({ t: "num", v: parseInt(src.slice(i, j), 10) });
      i = j; continue;
    }
    if (c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== "'") j++;
      if (j >= src.length) throw new Error("Unterminated string constant.");
      toks.push({ t: "lit", v: src.slice(i + 1, j) });
      i = j + 1; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const w = src.slice(i, j);
      const lw = w.toLowerCase();
      if (lw === "sigma" || lw === "pi" || lw === "rho") toks.push({ t: lw });
      else if (lw === "x") toks.push({ t: "x" });
      else if (lw === "union") toks.push({ t: "union" });
      else toks.push({ t: "name", v: w });
      i = j; continue;
    }
    throw new Error("Unexpected character \"" + c + "\".");
  }
  return toks;
}

function raParse(src) {
  const toks = raTokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];

  function expect(t, what) {
    const tk = next();
    if (!tk || tk.t !== t) throw new Error("Expected " + (what || "'" + t + "'") + (tk ? " but found '" + (tk.v !== undefined ? tk.v : tk.t) + "'." : " but the expression ended."));
    return tk;
  }

  function parseNameList() {
    const names = [expect("name", "an attribute name").v];
    while (peek() && peek().t === ",") { next(); names.push(expect("name", "an attribute name").v); }
    return names;
  }

  function parseOperand() {
    const tk = next();
    if (!tk) throw new Error("Expected an attribute or constant but the expression ended.");
    if (tk.t === "name") return { kind: "id", v: tk.v };
    if (tk.t === "num" || tk.t === "lit") return { kind: "lit", v: tk.v };
    throw new Error("Expected an attribute or constant in the condition.");
  }

  function parsePrimary() {
    const tk = peek();
    if (!tk) throw new Error("Expected an expression but found nothing.");
    if (tk.t === "sigma" || tk.t === "pi" || tk.t === "rho") {
      next();
      expect("[", "'[' after " + tk.t);
      let node;
      if (tk.t === "sigma") {
        const a = parseOperand();
        const opTok = next();
        if (!opTok || opTok.t !== "op") throw new Error("Expected a comparison (=, !=, <, <=, >, >=) in the selection condition.");
        const b = parseOperand();
        node = { type: "sigma", a: a, op: opTok.v, b: b };
      } else {
        node = { type: tk.t, names: parseNameList() };
      }
      expect("]", "']'");
      expect("(", "'(' after " + tk.t + "[...]");
      node.e = parseExpr();
      expect(")", "')'");
      return node;
    }
    if (tk.t === "(") {
      next();
      const e = parseExpr();
      expect(")", "')'");
      return e;
    }
    if (tk.t === "name") {
      next();
      if (peek() && peek().t === "op" && peek().v === "=") {
        next();
        const v = next();
        if (!v) throw new Error("Expected a constant after '='.");
        let val;
        if (v.t === "num" || v.t === "lit") val = v.v;
        else if (v.t === "name") val = v.v; // bare-word constant, as in  t = CHK
        else throw new Error("Expected a constant after '='.");
        return { type: "const", name: tk.v, value: val };
      }
      return { type: "rel", name: tk.v };
    }
    throw new Error("Unexpected '" + (tk.v !== undefined ? tk.v : tk.t) + "' at the start of an expression.");
  }

  function parseExpr() {
    let left = parsePrimary();
    while (peek() && (peek().t === "x" || peek().t === "union" || peek().t === "minus")) {
      const op = next().t;
      const right = parsePrimary();
      left = { type: op, left: left, right: right };
    }
    return left;
  }

  const e = parseExpr();
  if (p < toks.length) {
    const tk = toks[p];
    throw new Error("Unexpected '" + (tk.v !== undefined ? tk.v : tk.t) + "' after the end of the expression.");
  }
  return e;
}

function raDedupe(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const k = JSON.stringify(r);
    if (!seen.has(k)) { seen.add(k); out.push(r); }
  }
  return out;
}

function raFindAttr(attrs, name) {
  const ln = name.toLowerCase();
  for (let i = 0; i < attrs.length; i++) if (attrs[i].toLowerCase() === ln) return i;
  return -1;
}

function raCompare(a, b, op) {
  if (op === "=") return a === b;
  if (op === "!=") return a !== b;
  const x = typeof a === "number" ? a : parseFloat(String(a).replace("$", ""));
  const y = typeof b === "number" ? b : parseFloat(String(b).replace("$", ""));
  if (isNaN(x) || isNaN(y)) {
    if (op === "<") return String(a) < String(b);
    if (op === "<=") return String(a) <= String(b);
    if (op === ">") return String(a) > String(b);
    if (op === ">=") return String(a) >= String(b);
  }
  if (op === "<") return x < y;
  if (op === "<=") return x <= y;
  if (op === ">") return x > y;
  if (op === ">=") return x >= y;
  throw new Error("Unknown comparison " + op);
}

function raEval(node, rels) {
  switch (node.type) {
    case "rel": {
      let found = null;
      for (const k of Object.keys(rels)) {
        if (k.toLowerCase() === node.name.toLowerCase()) { found = rels[k]; break; }
      }
      if (!found) throw new Error("Unknown relation \"" + node.name + "\". Available: " + Object.keys(rels).join(", ") + ".");
      return { attrs: found.attrs.slice(), rows: found.rows.map(r => r.slice()) };
    }
    case "const":
      return { attrs: [node.name], rows: [[node.value]] };
    case "sigma": {
      const r = raEval(node.e, rels);
      const resolve = (o) => {
        if (o.kind === "id") {
          const idx = raFindAttr(r.attrs, o.v);
          if (idx >= 0) return { attr: idx };
          return { lit: o.v }; // bare word not matching an attribute: a constant, as in  type = CHK
        }
        return { lit: o.v };
      };
      const A = resolve(node.a), B = resolve(node.b);
      const rows = r.rows.filter(row => {
        const va = A.attr !== undefined ? row[A.attr] : A.lit;
        const vb = B.attr !== undefined ? row[B.attr] : B.lit;
        return raCompare(va, vb, node.op);
      });
      return { attrs: r.attrs, rows: rows };
    }
    case "pi": {
      const r = raEval(node.e, rels);
      const idx = node.names.map(n => {
        const i = raFindAttr(r.attrs, n);
        if (i < 0) throw new Error("Attribute \"" + n + "\" not found. Attributes here are: " + r.attrs.join(", ") + ".");
        return i;
      });
      return { attrs: idx.map(i => r.attrs[i]), rows: raDedupe(r.rows.map(row => idx.map(i => row[i]))) };
    }
    case "rho": {
      const r = raEval(node.e, rels);
      if (node.names.length !== r.attrs.length) {
        throw new Error("ρ must rename all attributes: got " + node.names.length + " name(s) for a relation with " + r.attrs.length + " attribute(s) (" + r.attrs.join(", ") + ").");
      }
      return { attrs: node.names.slice(), rows: r.rows };
    }
    case "x": {
      const l = raEval(node.left, rels), r = raEval(node.right, rels);
      const clash = l.attrs.filter(a => raFindAttr(r.attrs, a) >= 0);
      if (clash.length > 0) {
        throw new Error("Cross product would duplicate attribute name(s) " + clash.join(", ") + ". Use ρ to rename one side first.");
      }
      const rows = [];
      for (const a of l.rows) for (const b of r.rows) rows.push(a.concat(b));
      return { attrs: l.attrs.concat(r.attrs), rows: rows };
    }
    case "union": {
      const l = raEval(node.left, rels), r = raEval(node.right, rels);
      if (l.attrs.length !== r.attrs.length) throw new Error("∪ requires union-compatible relations (same number of attributes): " + l.attrs.length + " vs " + r.attrs.length + ".");
      return { attrs: l.attrs, rows: raDedupe(l.rows.concat(r.rows)) };
    }
    case "minus": {
      const l = raEval(node.left, rels), r = raEval(node.right, rels);
      if (l.attrs.length !== r.attrs.length) throw new Error("− requires union-compatible relations (same number of attributes): " + l.attrs.length + " vs " + r.attrs.length + ".");
      const rk = new Set(r.rows.map(x => JSON.stringify(x)));
      return { attrs: l.attrs, rows: raDedupe(l.rows.filter(x => !rk.has(JSON.stringify(x)))) };
    }
  }
  throw new Error("Internal error: unknown node type.");
}

// Run an RA expression; returns { columns, values } like the SQL engine.
function raRun(src, rels) {
  if (!src.trim()) throw new Error("Enter a relational algebra expression.");
  const result = raEval(raParse(src), rels);
  return { columns: result.attrs, values: result.rows };
}
