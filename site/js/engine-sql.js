/* SQL execution via sql.js (SQLite compiled to WebAssembly, loaded from CDN). */

const SQLJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

let _sqlPromise = null;
function loadSQL() {
  if (!_sqlPromise) {
    _sqlPromise = initSqlJs({ locateFile: f => SQLJS_CDN + f });
  }
  return _sqlPromise;
}

// A fresh database with the bibliography schema/data, plus optional lesson setup.
function freshDb(SQL, setup) {
  const db = new SQL.Database();
  db.run(BASE_DDL);
  if (setup) db.run(setup);
  return db;
}

// Execute possibly-multiple statements; return the LAST result set
// as { columns, values }, or null if no statement produced rows.
function sqlExec(db, sql) {
  const res = db.exec(sql);
  if (res.length === 0) return null;
  const last = res[res.length - 1];
  return { columns: last.columns, values: last.values };
}

// Run a single SELECT and always get column names, even with zero rows.
function sqlQuery(db, sql) {
  const stmt = db.prepare(sql);
  const columns = stmt.getColumnNames();
  const values = [];
  while (stmt.step()) values.push(stmt.get());
  stmt.free();
  return { columns: columns, values: values };
}

// Compare two { columns, values } results.
//  - null/empty results are treated as equal to empty results
//  - by default order-insensitive, ignoring column names (like the slides,
//    where results are sets of tuples)
//  - opts.ordered: compare row order too (for ORDER BY lessons)
//  - opts.checkColumns: also require identical column names (for DDL lessons)
function resultsEqual(actual, expected, opts) {
  opts = opts || {};
  const aRows = actual ? actual.values : [];
  const eRows = expected ? expected.values : [];
  if (aRows.length !== eRows.length) return false;
  if (aRows.length > 0) {
    if (!actual || !expected) return false;
    if (actual.columns.length !== expected.columns.length) return false;
  }
  if (opts.checkColumns) {
    if (!actual || !expected) return aRows.length === 0 && eRows.length === 0 && !!actual === !!expected;
    if (actual.columns.length !== expected.columns.length) return false;
    for (let i = 0; i < actual.columns.length; i++) {
      if (actual.columns[i].toLowerCase() !== expected.columns[i].toLowerCase()) return false;
    }
  }
  const key = r => JSON.stringify(r);
  let a = aRows.map(key), e = eRows.map(key);
  if (!opts.ordered) { a = a.slice().sort(); e = e.slice().sort(); }
  for (let i = 0; i < a.length; i++) if (a[i] !== e[i]) return false;
  return true;
}
