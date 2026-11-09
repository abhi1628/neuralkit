// src/lib/schemaCore.js — everything the schema visualizer needs that is NOT drawing
//
// Fixes over v1 (the old regex parser found 0 tables in a normal pg_dump):
//  • schema-qualified names (public.users), quotes "x" `x` [x], SQL Server [dbo].[Users]
//  • foreign keys from ALTER TABLE (what pg_dump / mysqldump / SSMS write), inline REFERENCES, composite and named constraints
//  • composite primary keys, UNIQUE / INDEX / KEY, SERIAL / AUTO_INCREMENT / IDENTITY, ENUM('a','b'), DECIMAL(10,2), arrays
//  • comments (-- # /* */), string literals containing ; or --, $$ blocks, COPY … FROM stdin data, GO / DELIMITER lines
//  • relationships carry cardinality (1:N, 1:1, M:N via junction tables), self-references, missing targets
//  • design checks, layered auto-layout, Mermaid + DBML export, sample JOIN queries

/* ═══════════════════════════════════════════════════════════════
   Text scanning helpers
═══════════════════════════════════════════════════════════════ */
function skipQuoted(s, i) { // s[i] is ' or " or ` ; returns index of the closing quote
  const q = s[i];
  let j = i + 1;
  while (j < s.length) {
    if (q === "'" && s[j] === '\\') { j += 2; continue; }
    if (s[j] === q) { if (s[j + 1] === q) { j += 2; continue; } return j; }
    j++;
  }
  return s.length - 1;
}

function dollarTag(s, i) {
  const m = /^\$([A-Za-z_]\w*)?\$/.exec(s.slice(i, i + 40));
  return m ? m[0] : null;
}

function removePsqlNoise(sql) {
  return sql
    .replace(/^\s*COPY\s+[^\n]*?\bFROM\s+stdin[^\n]*\n[\s\S]*?\n\\\.\s*$/gim, '')   // pg_dump data blocks
    .replace(/^\s*\\[^\n]*$/gm, '')                                                    // \connect, \. …
    .replace(/^\s*DELIMITER\s+\S+\s*$/gim, '')                                         // MySQL client directive
    .replace(/^\s*GO\s*$/gim, ';');                                                    // SQL Server batch separator
}

export function stripComments(sql) {
  let out = '', i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i], d = sql[i + 1];
    if (c === "'" || c === '"' || c === '`') { const j = skipQuoted(sql, i); out += sql.slice(i, j + 1); i = j + 1; continue; }
    if (c === '$') { const tag = dollarTag(sql, i); if (tag) { const e = sql.indexOf(tag, i + tag.length); const j = e === -1 ? n : e + tag.length; out += sql.slice(i, j); i = j; continue; } }
    if (c === '-' && d === '-') { while (i < n && sql[i] !== '\n') i++; continue; }
    if (c === '#' && (i === 0 || sql[i - 1] === '\n')) { while (i < n && sql[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { const e = sql.indexOf('*/', i + 2); i = e === -1 ? n : e + 2; out += ' '; continue; }
    out += c; i++;
  }
  return out;
}

/** Splits on ; outside quotes, parentheses and $$ blocks. */
export function splitStatements(sql) {
  const out = [];
  let cur = '', depth = 0, i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (c === "'" || c === '"' || c === '`') { const j = skipQuoted(sql, i); cur += sql.slice(i, j + 1); i = j + 1; continue; }
    if (c === '$') { const tag = dollarTag(sql, i); if (tag) { const e = sql.indexOf(tag, i + tag.length); const j = e === -1 ? n : e + tag.length; cur += sql.slice(i, j); i = j; continue; } }
    if (c === '[') { const m = /^\[[^\]\n]+\]/.exec(sql.slice(i, i + 130)); if (m) { cur += m[0]; i += m[0].length; continue; } }
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    if (c === ';' && depth === 0) { if (cur.trim()) out.push(cur.trim()); cur = ''; i++; continue; }
    cur += c; i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Index of the ) matching the ( at openIdx, or -1. */
function matchParen(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (c === "'" || c === '"' || c === '`') { i = skipQuoted(s, i); continue; }
    if (c === '[') { const m = /^\[[^\]\n]+\]/.exec(s.slice(i, i + 130)); if (m) { i += m[0].length - 1; continue; } }
    if (c === '(') depth++;
    else if (c === ')') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function splitTop(s, sep = ',') {
  const parts = [];
  let cur = '', depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "'" || c === '"' || c === '`') { const j = skipQuoted(s, i); cur += s.slice(i, j + 1); i = j; continue; }
    if (c === '[') { const m = /^\[[^\]\n]+\]/.exec(s.slice(i, i + 130)); if (m) { cur += m[0]; i += m[0].length - 1; continue; } }
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (c === sep && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/* ═══════════════════════════════════════════════════════════════
   Identifiers
═══════════════════════════════════════════════════════════════ */
const IDENT = String.raw`(?:"(?:[^"]|"")+"|` + '`[^`]+`' + String.raw`|\[[^\]]+\]|[A-Za-z_\u00C0-\uFFFF][\w$\u00C0-\uFFFF]*)`;
const QNAME = String.raw`${IDENT}(?:\s*\.\s*${IDENT}){0,2}`;
const unq = (id) => {
  const s = String(id).trim();
  if (s[0] === '"') return s.slice(1, -1).replace(/""/g, '"');
  if (s[0] === '`') return s.slice(1, -1);
  if (s[0] === '[') return s.slice(1, -1);
  return s;
};
function parseQName(str) {
  const parts = (String(str).match(new RegExp(IDENT, 'g')) || []).map(unq);
  const name = parts[parts.length - 1] || '';
  const schema = parts.length > 1 ? parts[parts.length - 2] : '';
  return { schema, name };
}
const colList = (str) => splitTop(String(str || '')).map((p) => { const m = new RegExp(`^(${IDENT})`).exec(p.trim()); return m ? unq(m[1]) : ''; }).filter(Boolean);

/* ═══════════════════════════════════════════════════════════════
   Statement parsers
═══════════════════════════════════════════════════════════════ */
const CREATE_TABLE = new RegExp(String.raw`^\s*CREATE\s+(?:OR\s+REPLACE\s+)?(?:(?:GLOBAL|LOCAL)\s+)?(?:(?:TEMP(?:ORARY)?|UNLOGGED|VIRTUAL|EXTERNAL)\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(${QNAME})\s*\(`, 'i');
const ALTER_TABLE = new RegExp(String.raw`^\s*ALTER\s+TABLE\s+(?:ONLY\s+)?(?:IF\s+EXISTS\s+)?(${QNAME})\s+([\s\S]*)$`, 'i');
const CREATE_INDEX = new RegExp(String.raw`^\s*CREATE\s+(UNIQUE\s+)?(?:(?:CLUSTERED|NONCLUSTERED|FULLTEXT|SPATIAL)\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?(?:${IDENT}\s+)?ON\s+(?:ONLY\s+)?(${QNAME})\s*(?:USING\s+\w+\s*)?\(`, 'i');

const SERIAL = /^(small|big)?serial$/i;
const TYPE_WORDS = /^(precision|varying|unsigned|signed|zerofill)\b/i;

function parseType(rest) {
  let s = rest.trim();
  let m = /^(?:"[^"]+"|\[[^\]]+\](?:\s*\.\s*\[[^\]]+\])?|`[^`]+`|[A-Za-z_][\w.]*)/.exec(s);
  if (!m) return { type: '', rest: s };
  let type = m[0][0] === '[' ? m[0].replace(/\s*\.\s*/g, '.').replace(/[\[\]]/g, '') : unq(m[0]);
  s = s.slice(m[0].length).trimStart();
  for (let guard = 0; guard < 6; guard++) {
    if (s[0] === '(') { const e = matchParen(s, 0); if (e < 0) break; type += s.slice(0, e + 1).replace(/\s+/g, ''); s = s.slice(e + 1).trimStart(); continue; }
    const tz = /^(with(?:out)?\s+time\s+zone|time\s+zone)\b/i.exec(s);
    if (tz) { type += ` ${tz[1].toLowerCase()}`; s = s.slice(tz[0].length).trimStart(); continue; }
    const w = TYPE_WORDS.exec(s);
    if (w) { type += ` ${w[1].toLowerCase()}`; s = s.slice(w[0].length).trimStart(); continue; }
    const arr = /^(\[\s*\d*\s*\])+/.exec(s);
    if (arr) { type += '[]'; s = s.slice(arr[0].length).trimStart(); continue; }
    break;
  }
  return { type, rest: s };
}

function parseRefTail(tail) {
  const onDelete = (/ON\s+DELETE\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/i.exec(tail) || [])[1];
  const onUpdate = (/ON\s+UPDATE\s+(CASCADE|SET\s+NULL|SET\s+DEFAULT|RESTRICT|NO\s+ACTION)/i.exec(tail) || [])[1];
  return { onDelete: onDelete ? onDelete.toUpperCase().replace(/\s+/g, ' ') : '', onUpdate: onUpdate ? onUpdate.toUpperCase().replace(/\s+/g, ' ') : '' };
}

/** Parses a table constraint / key clause. Returns a descriptor or null if it is not one. */
function parseConstraint(item) {
  const s = item.trim();
  let m = new RegExp(String.raw`^(?:CONSTRAINT\s+(${IDENT})\s+)?PRIMARY\s+KEY\s*(?:CLUSTERED|NONCLUSTERED)?\s*\(([\s\S]*)\)`, 'i').exec(s);
  if (m) return { kind: 'pk', name: m[1] ? unq(m[1]) : '', cols: colList(m[2]) };
  m = new RegExp(String.raw`^(?:CONSTRAINT\s+(${IDENT})\s+)?FOREIGN\s+KEY\s*(?:${IDENT}\s*)?\(([^)]*)\)\s*REFERENCES\s+(${QNAME})\s*(?:\(([^)]*)\))?([\s\S]*)$`, 'i').exec(s);
  if (m) return { kind: 'fk', name: m[1] ? unq(m[1]) : '', cols: colList(m[2]), ref: parseQName(m[3]), refCols: m[4] ? colList(m[4]) : [], ...parseRefTail(m[5] || '') };
  m = new RegExp(String.raw`^(?:CONSTRAINT\s+(${IDENT})\s+)?UNIQUE(?:\s+(?:KEY|INDEX))?\s*(?:${IDENT}\s*)?(?:CLUSTERED|NONCLUSTERED)?\s*\(([\s\S]*)\)`, 'i').exec(s);
  if (m) return { kind: 'unique', name: m[1] ? unq(m[1]) : '', cols: colList(m[2]) };
  m = new RegExp(String.raw`^(?:(?:FULLTEXT|SPATIAL)\s+)?(?:KEY|INDEX)\s*(?:${IDENT}\s*)?(?:USING\s+\w+\s*)?\(([\s\S]*?)\)`, 'i').exec(s);
  if (m) return { kind: 'index', name: '', cols: colList(m[1]) };
  if (/^(?:CONSTRAINT\s+\S+\s+)?(?:CHECK|EXCLUDE)\b/i.test(s)) return { kind: 'ignore' };
  return null;
}

function parseColumn(item) {
  const m = new RegExp(`^(${IDENT})\\s+([\\s\\S]*)$`).exec(item.trim());
  if (!m) return null;
  const name = unq(m[1]);
  const { type, rest } = parseType(m[2]);
  if (!type) return null;
  const u = rest.toUpperCase();
  const col = {
    name, type: SERIAL.test(type) ? ({ smallserial: 'smallint', serial: 'integer', bigserial: 'bigint' })[type.toLowerCase()] : type,
    notNull: /\bNOT\s+NULL\b/.test(u) || /\bPRIMARY\s+KEY\b/.test(u), pk: /\bPRIMARY\s+KEY\b/.test(u), unique: /\bUNIQUE\b/.test(u),
    autoInc: SERIAL.test(type) || /\b(AUTO_INCREMENT|AUTOINCREMENT|IDENTITY)\b|GENERATED\s+(?:ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY/.test(u),
    default: '', fk: null, indexed: false,
  };
  const d = /\bDEFAULT\s+([\s\S]+?)(?=\s+(?:NOT\s+NULL|NULL|PRIMARY|UNIQUE|REFERENCES|CHECK|COLLATE|COMMENT|CONSTRAINT|ON\s+UPDATE|GENERATED|AUTO_INCREMENT)\b|$)/i.exec(rest);
  if (d) col.default = d[1].trim().slice(0, 40);
  const r = new RegExp(String.raw`\bREFERENCES\s+(${QNAME})\s*(?:\(\s*(${IDENT})\s*\))?([\s\S]*)$`, 'i').exec(rest);
  if (r) col.fk = { ref: parseQName(r[1]), refCols: r[2] ? [unq(r[2])] : [], ...parseRefTail(r[3] || '') };
  return col;
}

/* ═══════════════════════════════════════════════════════════════
   Dialect guess
═══════════════════════════════════════════════════════════════ */
export function detectDialect(sql) {
  const s = String(sql);
  const score = {
    PostgreSQL: (/\bpublic\./i.test(s) ? 2 : 0) + (/\bserial\b|\bbigserial\b|character varying|::\w+|CREATE SEQUENCE|USING btree|timestamp(?:tz| with)/i.test(s) ? 2 : 0),
    MySQL: (/`/.test(s) ? 2 : 0) + (/ENGINE\s*=|AUTO_INCREMENT|UNSIGNED|CHARSET/i.test(s) ? 2 : 0),
    'SQL Server': (/\[dbo\]|IDENTITY\s*\(|NVARCHAR|^\s*GO\s*$/im.test(s) ? 3 : 0) + (/\bCLUSTERED\b/i.test(s) ? 1 : 0),
    SQLite: (/AUTOINCREMENT|WITHOUT ROWID|PRAGMA/i.test(s) ? 3 : 0),
  };
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best[1] >= 2 ? best[0] : 'Generic SQL';
}

/* ═══════════════════════════════════════════════════════════════
   Parse a whole script
═══════════════════════════════════════════════════════════════ */
export function parseSchema(sqlIn) {
  const raw = String(sqlIn ?? '');
  const dialect = detectDialect(raw);
  const statements = splitStatements(stripComments(removePsqlNoise(raw)));
  const warnings = [];
  const tables = [];
  const pendingFks = [];     // { table (id), cols, ref, refCols, name, onDelete, onUpdate }
  const pendingIndexes = []; // { table (qname), cols, unique }
  const keyOf = (q) => `${q.schema ? `${q.schema}.` : ''}${q.name}`;
  const find = (q) => {
    const lc = keyOf(q).toLowerCase();
    return tables.find((t) => t.id.toLowerCase() === lc) || (q.schema ? null : tables.find((t) => t.name.toLowerCase() === q.name.toLowerCase())) || tables.find((t) => t.name.toLowerCase() === q.name.toLowerCase());
  };

  for (const st of statements) {
    const ct = CREATE_TABLE.exec(st);
    if (ct) {
      const open = ct[0].length - 1;
      const close = matchParen(st, open);
      const tail = close >= 0 ? st.slice(close + 1) : '';
      if (/^\s*(?:PARTITION\s+OF|INHERITS\s*\(\s*\w)/i.test(tail) && close < 0) continue;
      const body = close >= 0 ? st.slice(open + 1, close) : st.slice(open + 1);
      const q = parseQName(ct[1]);
      if (/^\s*LIKE\b/i.test(body)) { warnings.push(`Table “${q.name}” uses LIKE and could not be expanded.`); continue; }
      const table = { id: keyOf(q), name: q.name, schema: q.schema, columns: [], primaryKey: [], uniques: [], indexes: [], comment: '' };
      for (const item of splitTop(body)) {
        const cons = parseConstraint(item);
        if (cons) {
          if (cons.kind === 'pk') table.primaryKey = cons.cols;
          else if (cons.kind === 'fk') pendingFks.push({ table: table.id, ...cons });
          else if (cons.kind === 'unique') table.uniques.push(cons.cols);
          else if (cons.kind === 'index') table.indexes.push(cons.cols);
          continue;
        }
        const col = parseColumn(item);
        if (col) table.columns.push(col);
      }
      // inline constraints → table-level
      table.columns.forEach((c) => {
        if (c.pk && !table.primaryKey.includes(c.name)) table.primaryKey.push(c.name);
        if (c.unique) table.uniques.push([c.name]);
        if (c.fk) pendingFks.push({ table: table.id, name: '', cols: [c.name], ref: c.fk.ref, refCols: c.fk.refCols, onDelete: c.fk.onDelete, onUpdate: c.fk.onUpdate });
      });
      if (!find(q) || find(q).id.toLowerCase() !== table.id.toLowerCase()) tables.push(table);
      continue;
    }

    const at = ALTER_TABLE.exec(st);
    if (at) {
      const q = parseQName(at[1]);
      const clauses = splitTop(at[2].replace(/^\s*WITH\s+(?:NO)?CHECK\s+/i, ''));
      for (let clause of clauses) {
        clause = clause.replace(/^\s*WITH\s+(?:NO)?CHECK\s+/i, '').trim();
        const add = /^ADD\s+(?:COLUMN\s+)?([\s\S]*)$/i.exec(clause);
        if (!add) continue;
        const cons = parseConstraint(add[1]);
        if (!cons) continue;
        const tid = (find(q) || { id: keyOf(q) }).id;
        if (cons.kind === 'fk') pendingFks.push({ table: tid, ...cons });
        else { const t = find(q); if (!t) continue; if (cons.kind === 'pk') t.primaryKey = cons.cols; else if (cons.kind === 'unique') t.uniques.push(cons.cols); else if (cons.kind === 'index') t.indexes.push(cons.cols); }
      }
      continue;
    }

    const ci = CREATE_INDEX.exec(st);
    if (ci) {
      const open = ci[0].length - 1, close = matchParen(st, open);
      if (close > 0) pendingIndexes.push({ table: parseQName(ci[2]), cols: colList(st.slice(open + 1, close)), unique: !!ci[1] });
    }
  }

  tables.forEach((t) => { if (!t.columns.length) warnings.push(`Table “${t.name}” has no readable columns.`); });
  pendingIndexes.forEach((ix) => { const t = find(ix.table); if (t) { (ix.unique ? t.uniques : t.indexes).push(ix.cols); } });

  // mark column facts
  tables.forEach((t) => {
    t.columns.forEach((c) => {
      c.pk = t.primaryKey.includes(c.name);
      if (c.pk) c.notNull = true;
      c.unique = c.unique || t.uniques.some((u) => u.length === 1 && u[0] === c.name);
      c.indexed = c.pk || t.uniques.some((u) => u[0] === c.name) || t.indexes.some((i) => i[0] === c.name) || (t.primaryKey[0] === c.name);
    });
  });

  // relationships
  const relations = [];
  pendingFks.forEach((fk, idx) => {
    const child = tables.find((t) => t.id === fk.table) || find(parseQName(fk.table));
    if (!child) return;
    const parent = find(fk.ref);
    const refCols = fk.refCols.length ? fk.refCols : (parent ? parent.primaryKey.slice(0, fk.cols.length) : []);
    const childCols = fk.cols.map((cn) => child.columns.find((c) => c.name.toLowerCase() === cn.toLowerCase())).filter(Boolean);
    const nullable = childCols.some((c) => !c.notNull);
    const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
    const names = childCols.map((c) => c.name);
    const childOne = sameSet(names, child.primaryKey) || child.uniques.some((u) => sameSet(names, u));
    relations.push({
      id: `r${idx}`, name: fk.name, from: { table: child.id, columns: names.length ? names : fk.cols }, to: { table: parent ? parent.id : null, tableName: fk.ref.name, columns: refCols },
      onDelete: fk.onDelete, onUpdate: fk.onUpdate, optional: nullable, childOne, missingTarget: !parent, selfRef: !!parent && parent.id === child.id,
    });
    childCols.forEach((c) => { c.fk = { table: parent ? parent.id : fk.ref.name, column: refCols[names.indexOf(c.name)] || refCols[0] || '' }; });
  });

  // junction tables (many-to-many)
  tables.forEach((t) => {
    const rels = relations.filter((r) => r.from.table === t.id && r.to.table && !r.selfRef);
    const fkCols = new Set(rels.flatMap((r) => r.from.columns));
    const distinctParents = new Set(rels.map((r) => r.to.table));
    t.junction = distinctParents.size >= 2 && t.primaryKey.length > 0 && t.primaryKey.every((c) => fkCols.has(c)) && t.columns.length <= fkCols.size + 3
      || (distinctParents.size >= 2 && t.primaryKey.length === 0 && t.columns.every((c) => fkCols.has(c)));
  });

  return { tables, relations, warnings, dialect, statementCount: statements.length };
}

/* ═══════════════════════════════════════════════════════════════
   Type families (for foreign-key mismatch checks)
═══════════════════════════════════════════════════════════════ */
export function typeFamily(type) {
  const t = String(type || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/\s+(unsigned|signed|zerofill)\b/g, '').trim();
  if (/\[\]$/.test(t)) return 'array';
  if (/^(bigint|int8|bigserial)$/.test(t)) return 'int8';
  if (/^(int|integer|int4|mediumint|serial)$/.test(t)) return 'int4';
  if (/^(smallint|int2|tinyint|smallserial)$/.test(t)) return 'int2';
  if (/^(numeric|decimal|number|money)$/.test(t)) return 'decimal';
  if (/^(float|double|double precision|real|float4|float8)$/.test(t)) return 'float';
  if (/^(uuid|uniqueidentifier)$/.test(t)) return 'uuid';
  if (/^(varchar|char|character|character varying|nvarchar|nchar|text|citext|string|tinytext|mediumtext|longtext)$/.test(t)) return 'text';
  if (/^(timestamp|timestamptz|datetime|datetime2|timestamp with time zone|timestamp without time zone)$/.test(t)) return 'timestamp';
  if (/^(date)$/.test(t)) return 'date';
  if (/^(bool|boolean|bit)$/.test(t)) return 'bool';
  return t || 'unknown';
}

/* ═══════════════════════════════════════════════════════════════
   Design checks
═══════════════════════════════════════════════════════════════ */
export function analyzeSchema(schema) {
  const issues = [];
  const byId = new Map(schema.tables.map((t) => [t.id, t]));
  const add = (level, table, message, hint = '', column = '') => issues.push({ level, table, column, message, hint });

  schema.tables.forEach((t) => {
    if (!t.primaryKey.length) add(t.uniques.length ? 'warn' : 'error', t.name, 'No primary key.', 'Every table should identify its rows uniquely — add a PRIMARY KEY (for example an id column).');
    const seen = new Set();
    t.columns.forEach((c) => { const k = c.name.toLowerCase(); if (seen.has(k)) add('error', t.name, `Duplicate column name “${c.name}”.`, '', c.name); seen.add(k); });
    t.primaryKey.forEach((p) => { if (!t.columns.some((c) => c.name.toLowerCase() === p.toLowerCase())) add('error', t.name, `Primary key refers to a column that doesn’t exist: “${p}”.`, '', p); });
    if (t.columns.length === 1 && !t.junction) add('info', t.name, 'Only one column.', 'Is this table needed, or should it be a column elsewhere?');
    const linked = schema.relations.some((r) => r.from.table === t.id || r.to.table === t.id);
    if (!linked && schema.tables.length > 1) add('info', t.name, 'Not connected to any other table.', 'If it should relate to other tables, add a FOREIGN KEY.');
  });

  schema.relations.forEach((r) => {
    const child = byId.get(r.from.table);
    const parent = r.to.table ? byId.get(r.to.table) : null;
    const label = `${child.name}.${r.from.columns.join(', ')}`;
    if (!parent) { add('error', child.name, `${label} references a table that isn’t in this script: “${r.to.tableName}”.`, 'Include that table’s CREATE TABLE, or fix the name.', r.from.columns[0]); return; }
    r.to.columns.forEach((pc, i) => {
      const pcol = parent.columns.find((c) => c.name.toLowerCase() === pc.toLowerCase());
      const ccol = child.columns.find((c) => c.name.toLowerCase() === (r.from.columns[i] || '').toLowerCase());
      if (!pcol) { add('error', child.name, `${label} points to ${parent.name}.${pc}, which doesn’t exist.`, '', r.from.columns[0]); return; }
      if (ccol) {
        const a = typeFamily(ccol.type), b = typeFamily(pcol.type);
        if (a !== b) add('warn', child.name, `Type mismatch: ${child.name}.${ccol.name} is ${ccol.type} but ${parent.name}.${pcol.name} is ${pcol.type}.`, 'Use the same type on both sides so joins are fast and safe.', ccol.name);
        if (!parent.primaryKey.includes(pcol.name) && !parent.uniques.some((u) => u.length === 1 && u[0] === pcol.name)) add('warn', child.name, `${label} references ${parent.name}.${pc}, which is not a primary or unique key.`, 'Most databases require the referenced column to be unique.', ccol.name);
      }
    });
    const first = child.columns.find((c) => c.name.toLowerCase() === (r.from.columns[0] || '').toLowerCase());
    if (first && !first.indexed && !r.selfRef) add('info', child.name, `${label} has no index.`, `Joins and deletes on the parent are faster with an index: CREATE INDEX ON ${child.name} (${r.from.columns.join(', ')});`, first.name);
  });

  const order = { error: 0, warn: 1, info: 2 };
  return issues.sort((a, b) => order[a.level] - order[b.level]);
}

/* ═══════════════════════════════════════════════════════════════
   Layout (layered by foreign-key depth; parents on the left)
═══════════════════════════════════════════════════════════════ */
export const LAYOUT = { width: 250, header: 32, row: 22, gapX: 120, gapY: 36, maxCols: 14 };

export function tableHeight(t, expanded = false) {
  const shown = expanded ? t.columns.length : Math.min(t.columns.length, LAYOUT.maxCols);
  return LAYOUT.header + shown * LAYOUT.row + (t.columns.length > shown ? LAYOUT.row : 0) + 6;
}

export function layoutTables(schema, expandedIds = new Set()) {
  const { tables, relations } = schema;
  const ids = tables.map((t) => t.id);
  const out = new Map(); // id → parents it points to
  ids.forEach((id) => out.set(id, new Set()));
  relations.forEach((r) => { if (r.to.table && !r.selfRef && out.has(r.from.table)) out.get(r.from.table).add(r.to.table); });

  const rank = new Map();
  const visiting = new Set();
  const calc = (id) => {
    if (rank.has(id)) return rank.get(id);
    if (visiting.has(id)) return 0; // cycle
    visiting.add(id);
    let r = 0;
    out.get(id).forEach((p) => { r = Math.max(r, calc(p) + 1); });
    visiting.delete(id);
    rank.set(id, r);
    return r;
  };
  ids.forEach(calc);

  const connected = new Set();
  relations.forEach((r) => { if (r.to.table) { connected.add(r.from.table); connected.add(r.to.table); } });
  const layers = [];
  ids.filter((id) => connected.has(id)).forEach((id) => { const r = rank.get(id); (layers[r] = layers[r] || []).push(id); });
  const filled = layers.map((l) => l || []);

  // barycenter ordering to reduce crossings
  const pos = new Map();
  filled.forEach((l) => l.forEach((id, i) => pos.set(id, i)));
  const neighbours = (id) => [...relations.filter((r) => r.from.table === id && r.to.table && !r.selfRef).map((r) => r.to.table), ...relations.filter((r) => r.to.table === id && !r.selfRef).map((r) => r.from.table)];
  for (let sweep = 0; sweep < 3; sweep++) {
    filled.forEach((layer, li) => {
      const score = (id) => { const ns = neighbours(id).filter((n) => pos.has(n)); return ns.length ? ns.reduce((a, n) => a + pos.get(n) + (rank.get(n) !== li ? 0 : 0), 0) / ns.length : pos.get(id); };
      layer.sort((a, b) => score(a) - score(b));
      layer.forEach((id, i) => pos.set(id, i));
    });
  }

  const heights = new Map(tables.map((t) => [t.id, tableHeight(t, expandedIds.has(t.id))]));
  const result = {};
  let x = 0, maxY = 0;
  filled.forEach((layer) => {
    if (!layer.length) return;
    const perCol = Math.max(1, Math.min(layer.length, Math.ceil(layer.length / Math.ceil(layer.length / 7))));
    for (let start = 0; start < layer.length; start += perCol) {
      let y = 0;
      layer.slice(start, start + perCol).forEach((id) => { result[id] = { x, y, w: LAYOUT.width, h: heights.get(id) }; y += heights.get(id) + LAYOUT.gapY; });
      maxY = Math.max(maxY, y);
      x += LAYOUT.width + LAYOUT.gapX;
    }
  });
  // unconnected tables: a grid underneath
  const loose = ids.filter((id) => !connected.has(id));
  if (loose.length) {
    const per = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(loose.length))));
    const startY = maxY + (filled.length ? 30 : 0);
    const rowsH = [];
    loose.forEach((id, i) => { const col = i % per, row = Math.floor(i / per); rowsH[row] = Math.max(rowsH[row] || 0, heights.get(id)); });
    loose.forEach((id, i) => {
      const col = i % per, row = Math.floor(i / per);
      const y = startY + rowsH.slice(0, row).reduce((a, h) => a + h + LAYOUT.gapY, 0);
      result[id] = { x: col * (LAYOUT.width + 40), y, w: LAYOUT.width, h: heights.get(id) };
    });
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════
   Exports
═══════════════════════════════════════════════════════════════ */
const mmName = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, '_').replace(/^([^A-Za-z])/, 'T_$1');
const mmType = (s) => String(s || 'unknown').replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-\[\]()]/g, '').replace(/^([^A-Za-z])/, 'T$1') || 'unknown';

export function toMermaid(schema) {
  const L = ['erDiagram'];
  schema.tables.forEach((t) => {
    L.push(`  ${mmName(t.name)} {`);
    t.columns.forEach((c) => {
      const keys = [c.pk ? 'PK' : '', c.fk ? 'FK' : '', c.unique && !c.pk ? 'UK' : ''].filter(Boolean).join(', ');
      L.push(`    ${mmType(c.type)} ${mmName(c.name)}${keys ? ` ${keys}` : ''}`);
    });
    L.push('  }');
  });
  const byId = new Map(schema.tables.map((t) => [t.id, t]));
  schema.relations.forEach((r) => {
    const child = byId.get(r.from.table), parent = r.to.table ? byId.get(r.to.table) : null;
    if (!child || !parent) return;
    const left = r.optional ? '|o' : '||';
    const right = r.childOne ? (r.optional ? 'o|' : '||') : 'o{';
    L.push(`  ${mmName(parent.name)} ${left}--${right} ${mmName(child.name)} : "${r.from.columns.join(', ').replace(/"/g, '')}"`);
  });
  return L.join('\n');
}

export function toDbml(schema) {
  const q = (s) => (/^[A-Za-z_]\w*$/.test(s) ? s : `"${s}"`);
  const L = [];
  schema.tables.forEach((t) => {
    L.push(`Table ${q(t.name)} {`);
    t.columns.forEach((c) => {
      const attrs = [c.pk ? 'pk' : '', c.unique && !c.pk ? 'unique' : '', c.notNull && !c.pk ? 'not null' : '', c.autoInc ? 'increment' : '', c.default ? `default: ${/^[\w.]+$/.test(c.default) ? c.default : `'${c.default.replace(/'/g, '')}'`}` : ''].filter(Boolean);
      L.push(`  ${q(c.name)} ${String(c.type).replace(/\s+/g, '_')}${attrs.length ? ` [${attrs.join(', ')}]` : ''}`);
    });
    L.push('}', '');
  });
  const byId = new Map(schema.tables.map((t) => [t.id, t]));
  schema.relations.forEach((r) => {
    const child = byId.get(r.from.table), parent = r.to.table ? byId.get(r.to.table) : null;
    if (!child || !parent) return;
    const fc = r.from.columns.map(q), pc = r.to.columns.map(q);
    const ends = r.from.columns.length > 1 ? `(${fc.join(', ')})` : fc[0];
    const pends = r.to.columns.length > 1 ? `(${pc.join(', ')})` : pc[0] || 'id';
    L.push(`Ref: ${q(child.name)}.${ends} ${r.childOne ? '-' : '>'} ${q(parent.name)}.${pends}${r.onDelete ? ` [delete: ${r.onDelete.toLowerCase()}]` : ''}`);
  });
  return L.join('\n');
}

/* ───────── sample JOIN queries ───────── */
const needsQuote = (s) => !/^[a-z_][a-z0-9_]*$/.test(s);
const qi = (s) => (needsQuote(s) ? `"${s}"` : s);

export function sampleQueries(schema) {
  const out = [];
  const byId = new Map(schema.tables.map((t) => [t.id, t]));
  const used = new Set();
  const alias = (name) => { let a = name.replace(/[^A-Za-z]/g, '').slice(0, 1).toLowerCase() || 't'; let i = 1; let cand = a; while (used.has(cand)) cand = `${a}${++i}`; used.add(cand); return cand; };
  const fresh = () => used.clear();

  schema.relations.filter((r) => r.to.table && !r.selfRef).slice(0, 12).forEach((r) => {
    const child = byId.get(r.from.table), parent = byId.get(r.to.table);
    fresh(); const c = alias(child.name), p = alias(parent.name);
    const on = r.from.columns.map((col, i) => `${c}.${qi(col)} = ${p}.${qi(r.to.columns[i] || parent.primaryKey[i] || 'id')}`).join(' AND ');
    out.push({ title: `${child.name} with its ${parent.name}`, sql: `SELECT ${c}.*, ${p}.*\nFROM ${qi(child.name)} ${c}\nJOIN ${qi(parent.name)} ${p} ON ${on};`, explain: `Each ${child.name} row is matched to the ${parent.name} row it points to.` });
    const pk = parent.primaryKey[0] || r.to.columns[0] || 'id';
    out.push({ title: `${parent.name} with a count of ${child.name}`, sql: `SELECT ${p}.${qi(pk)}, COUNT(${c}.${qi(r.from.columns[0])}) AS ${qi(`${child.name}_count`)}\nFROM ${qi(parent.name)} ${p}\nLEFT JOIN ${qi(child.name)} ${c} ON ${on}\nGROUP BY ${p}.${qi(pk)}\nORDER BY ${qi(`${child.name}_count`)} DESC;`, explain: `LEFT JOIN keeps ${parent.name} rows that have no ${child.name} (count 0).` });
    out.push({ title: `${parent.name} without any ${child.name}`, sql: `SELECT ${p}.*\nFROM ${qi(parent.name)} ${p}\nLEFT JOIN ${qi(child.name)} ${c} ON ${on}\nWHERE ${c}.${qi(r.from.columns[0])} IS NULL;`, explain: 'The LEFT JOIN + IS NULL pattern finds rows with no match.' });
  });

  schema.tables.filter((t) => t.junction).forEach((t) => {
    const rels = schema.relations.filter((r) => r.from.table === t.id && r.to.table && !r.selfRef).slice(0, 2);
    if (rels.length < 2) return;
    const [a, b] = rels.map((r) => byId.get(r.to.table));
    fresh(); const ja = alias(a.name), jj = alias(t.name), jb = alias(b.name);
    const on = (r, pa, ch) => r.from.columns.map((col, i) => `${ch}.${qi(col)} = ${pa}.${qi(r.to.columns[i] || byId.get(r.to.table).primaryKey[i] || 'id')}`).join(' AND ');
    out.unshift({ title: `Many-to-many: ${a.name} ↔ ${b.name}`, sql: `SELECT ${ja}.*, ${jb}.*\nFROM ${qi(a.name)} ${ja}\nJOIN ${qi(t.name)} ${jj} ON ${on(rels[0], ja, jj)}\nJOIN ${qi(b.name)} ${jb} ON ${on(rels[1], jb, jj)};`, explain: `${t.name} is a junction table: it links many ${a.name} rows to many ${b.name} rows.` });
  });
  return out;
}

/* ───────── sample script ───────── */
export const SAMPLE_SQL = `-- Online shop (PostgreSQL style)
CREATE TABLE public.customers (
    id          serial PRIMARY KEY,
    name        varchar(100) NOT NULL,
    email       varchar(255) NOT NULL UNIQUE,
    created_at  timestamp with time zone DEFAULT now()
);

CREATE TABLE public.categories (
    id         serial PRIMARY KEY,
    name       varchar(80) NOT NULL,
    parent_id  integer REFERENCES public.categories (id)   -- self-reference
);

CREATE TABLE public.products (
    id           serial PRIMARY KEY,
    name         varchar(150) NOT NULL,
    price        numeric(10,2) NOT NULL,
    category_id  integer REFERENCES public.categories (id) ON DELETE SET NULL
);

CREATE TABLE public.orders (
    id           serial PRIMARY KEY,
    customer_id  integer NOT NULL,
    status       varchar(20) DEFAULT 'new',
    placed_at    timestamp with time zone DEFAULT now()
);

CREATE TABLE public.order_items (
    order_id    integer NOT NULL,
    product_id  integer NOT NULL,
    quantity    integer NOT NULL DEFAULT 1,
    PRIMARY KEY (order_id, product_id)
);

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_fkey FOREIGN KEY (customer_id) REFERENCES public.customers (id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT items_order_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT items_product_fkey FOREIGN KEY (product_id) REFERENCES public.products (id);

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);`;
