/* Lesson content for the CS 348 Midterm 2 tutorial.
 * Content follows the lecture handouts:
 *   Part 1 = Module 3 (Basic SQL), Part 2 = Module 4 (Relational Algebra),
 *   Part 3 = Module 5 (Advanced SQL).
 *
 * Lesson fields:
 *   type: "sql" (interactive SQL console) | "ra" (relational algebra console)
 *         | "reading" (prose + multiple-choice self-check)
 *   showTables: tables rendered above the console (SQL lessons)
 *   raData: "bank" | "bib" (RA lessons)
 *   setup: extra SQL run after the base schema (SQL lessons)
 *   dml:  true = tasks change the database and are checked with task.verify,
 *         expected states are computed by applying solutions in order
 *   tasks: { prompt, solution, verify?, ordered?, checkColumns?, hint? }
 *          or { quiz:true, prompt, choices:[...], answer: index }
 */

const PART1 = "Part 1 · Basic SQL (Module 3)";
const PART2 = "Part 2 · Relational Algebra (Module 4)";
const PART3 = "Part 3 · Advanced SQL (Module 5)";

const LESSONS = [

/* ============================================================ Lesson 1 */
{
  id: 1, part: PART1, type: "sql",
  title: "SELECT queries and the bibliography database",
  showTables: ["author", "publication", "wrote"],
  html: `
<p>SQL was developed as part of the <em>System R</em> project at IBM in the 70s and is
the standard interface to relational database systems. Its query language is based on the
relational calculus: you describe <em>what</em> you want, and the system figures out how to
compute it.</p>

<p>Throughout these lessons we use the <b>bibliography database</b> from lecture:
authors (<code>AUTHOR</code>) write publications (<code>PUBLICATION</code>), and the
relationship between them is recorded in <code>WROTE</code>. Publications are further
classified in <code>BOOK</code>, <code>JOURNAL</code>, <code>PROCEEDINGS</code> and
<code>ARTICLE</code> (more on those later).</p>

<p>The most basic query in SQL is the <b>SELECT block</b>, which has three clauses that are
logically evaluated in this order: <code>FROM</code> (which tables), then
<code>WHERE</code> (which rows qualify), then <code>SELECT</code> (which values to output):</p>

<pre class="sql">SELECT DISTINCT &lt;results&gt;
FROM            &lt;tables&gt;
WHERE           &lt;condition&gt;</pre>

<p>To list every row of a table, select all columns (<code>*</code>) from it:</p>

<pre class="sql">select distinct *
from publication</pre>

<pre class="out">PUBID       TITLE
----------- -------------------------
          1 Mathematical Logic
          3 Trans. on Databases
          2 Principles of DB Systems
          4 Query Languages

  4 record(s) selected.</pre>

<p>Two things to note from lecture:</p>
<p>1. The <code>FROM</code> clause <em>cannot be used on its own</em> — you always need a
<code>SELECT</code> clause with it.<br>
2. <code>DISTINCT</code> asks for <em>set semantics</em>: duplicate rows are eliminated from
the answer, exactly as in the relational calculus. (SQL's default without
<code>DISTINCT</code> is <em>multiset</em> semantics — Lesson 19.)</p>

<p class="note"><b>Note:</b> SQL is not case sensitive — <code>SELECT</code>,
<code>select</code> and <code>Select</code> all work.</p>

<p class="note"><b>About the exercise database:</b> the console below runs on an
<em>extended</em> version of the lecture instance — every row from the slides is present,
plus extra authors and publications. Example outputs quoted in the lessons show the tiny
slide instance; run the queries yourself to see them on the full one. Tasks are pitched at
midterm level: expect to think, and use the <em>Solution</em> link in the tasks panel only
to check yourself.</p>

<p class="note"><b>The editor</b> runs your query when you press <b>Run ▶</b>, hit
<code>Cmd/Ctrl+Enter</code>, or click away from it. The table names above the results are
tabs — click one to peek at that table without losing what you've typed. The editor
supports VS Code-style shortcuts: <code>Tab</code>/<code>Shift+Tab</code> to
indent/outdent, <code>Cmd/Ctrl+[</code> and <code>Cmd/Ctrl+]</code> to change indentation,
and <code>Cmd/Ctrl+/</code> to toggle <code>--</code> comments.</p>
`,
  tasks: [
    { prompt: "List the titles (only) of all publications.",
      solution: "select distinct title from publication" },
    { prompt: "List the names (only) of all authors.",
      solution: "select distinct name from author" },
    { prompt: "List the ids of all authors who wrote at least one publication — each id exactly once.",
      solution: "select distinct author from wrote" }
  ]
},

/* ============================================================ Lesson 2 */
{
  id: 2, part: PART1, type: "sql",
  title: "Queries with constraints (the WHERE clause)",
  showTables: ["article", "journal", "proceedings", "book"],
  html: `
<p>The <code>WHERE</code> clause states <b>additional conditions</b> that a tuple must satisfy
to qualify for the answer:</p>

<pre class="sql">WHERE &lt;condition&gt;</pre>

<p>The standard <em>atomic</em> conditions are:</p>
<p>1. equality and inequality: <code>=</code>, <code>!=</code> (on all types)<br>
2. order comparisons: <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>,
<code>&gt;=</code>, <code>&lt;&gt;</code> (on numeric and string types)</p>

<p>Conditions may involve <b>expressions</b> over attribute values, e.g. arithmetic:</p>

<pre class="sql">select * from article
where endpage - startpage &gt; 4</pre>

<pre class="out">PUBID       APPEARS_IN  STARTPAGE   ENDPAGE
----------- ----------- ----------- -----------
          4           2          30          41

  1 record(s) selected.</pre>

<p>Atomic conditions can be combined with the <b>boolean connectives</b> <code>AND</code>,
<code>OR</code> and <code>NOT</code>:</p>

<pre class="sql">select * from journal
where year &gt;= 1990 and volume = 35</pre>

<p>A condition that no row satisfies simply yields an empty answer — on the tiny slide
instance, the lecture's <em>“find all journals printed since 1997”</em> returned
<code>0 record(s) selected</code>. (Our extended instance does have one — check!)</p>

<p>Remember the number of pages of an article is <code>endpage - startpage + 1</code>
(both endpoints count), a classic off-by-one to watch on the exam.</p>
`,
  tasks: [
    { prompt: "Find all articles that start on page 50 or later and are shorter than 10 pages.",
      solution: "select * from article where startpage >= 50 and endpage - startpage + 1 < 10" },
    { prompt: "Find all journals that were published in 1995 or later, or whose number is 1.",
      solution: "select * from journal where year >= 1995 or number = 1" },
    { prompt: "Find all proceedings from the 1990s (1990–1999 inclusive; do not use BETWEEN).",
      solution: "select * from proceedings where year >= 1990 and year <= 1999" },
    { prompt: "Find all books not published by AMS that appeared after 1990.",
      solution: "select * from book where publisher != 'AMS' and year > 1990" }
  ]
},

/* ============================================================ Lesson 3 */
{
  id: 3, part: PART1, type: "sql",
  title: "Multi-table queries and tuple variables",
  showTables: ["author", "wrote", "publication", "proceedings", "article"],
  html: `
<p>The <code>FROM</code> clause can list several tables. Its general form is</p>

<pre class="sql">FROM R1 [AS] n1, ..., Rk [AS] nk</pre>

<p>and it represents a <b>conjunction</b> R<sub>1</sub> ∧ … ∧ R<sub>k</sub>: conceptually,
every combination of rows from the listed tables is considered, and the
<code>WHERE</code> condition selects the combinations that belong together.</p>

<p>Unlike the relational calculus, which uses positional notation, SQL uses
<b>correlations</b> (tuple variables) and <b>attribute names</b>: writing
<code>wrote r1</code> makes <code>r1</code> a variable ranging over rows of
<code>WROTE</code>, whose components are accessed as <code>r1.author</code> and
<code>r1.publication</code>. A table can serve as its own correlation name when this is
unambiguous:</p>

<pre class="sql">select distinct title
from publication, book
where publication.pubid = book.pubid</pre>

<pre class="out">TITLE
-------------------------
Mathematical Logic

  1 record(s) selected.</pre>

<p>Explicit correlation names are <em>required</em> when the same table is used twice
(a “self-join”). Variables cannot be shared between the two uses, so the join condition
must be written out explicitly:</p>

<pre class="sql">select distinct r1.publication
from wrote r1, wrote r2
where r1.publication = r2.publication
  and r1.author != r2.author</pre>

<pre class="out">PUBLICATION
-----------
          2

  1 record(s) selected.</pre>

<p>This finds publications with at least two (different) authors.</p>
`,
  tasks: [
    { prompt: "List the titles of all proceedings.",
      solution: "select distinct title from publication, proceedings where publication.pubid = proceedings.pubid" },
    { prompt: "List each author name together with the title of each article they wrote.",
      solution: "select distinct name, title from author, wrote, publication, article where aid = wrote.author and wrote.publication = publication.pubid and publication.pubid = article.pubid" },
    { prompt: "List all ordered pairs of different author ids who coauthored at least one publication.",
      solution: "select distinct r1.author, r2.author from wrote r1, wrote r2 where r1.publication = r2.publication and r1.author != r2.author",
      hint: "A self-join of WROTE with two correlation names." },
    { prompt: "Challenge: list the titles of publications with at least three different authors.",
      solution: "select distinct title from publication, wrote w1, wrote w2, wrote w3 where pubid = w1.publication and w1.publication = w2.publication and w2.publication = w3.publication and w1.author != w2.author and w1.author != w3.author and w2.author != w3.author",
      hint: "Three copies of WROTE, and all three pairwise inequalities." }
  ]
},

/* ============================================================ Lesson 4 */
{
  id: 4, part: PART1, type: "sql",
  title: "The SELECT clause: expressions and naming",
  showTables: ["article", "publication", "book", "journal"],
  html: `
<p>The <code>SELECT</code> clause determines what each answer tuple contains:</p>

<pre class="sql">SELECT DISTINCT e1 [AS] n1, ..., ek [AS] nk</pre>

<p>It operates as follows: (1) superfluous attributes and remaining duplicates are eliminated,
(2) the <b>expressions</b> e<sub>i</sub> are evaluated, and (3) the names n<sub>i</sub> are given
to the resulting values.</p>

<p>Expressions can <em>create</em> values using built-in functions: arithmetic
(<code>+ - * /</code>) on numbers, concatenation (<code>||</code>) and
<code>substr</code> on strings, and constants (<code>select 1</code> is a valid query in
SQL-92!). All attribute names used must come from tables in the <code>FROM</code> clause.</p>

<pre class="sql">select distinct pubid, endpage - startpage + 1
from article</pre>

<pre class="out">PUBID       2
----------- -----------
          4          12

  1 record(s) selected.</pre>

<p>Notice the column of the computed expression got the meaningless name <code>2</code>: for
expressions the result attribute name is <em>implementation dependent</em>. Good practice from
lecture: <b>always name every expression with AS</b>, so query results look like instances of
tables:</p>

<pre class="sql">select distinct pubid as id,
       endpage - startpage + 1 as numberofpages
from article</pre>

<pre class="out">ID          NUMBEROFPAGES
----------- -------------
          4            12

  1 record(s) selected.</pre>
`,
  tasks: [
    { prompt: "For every article list the pubid and the number of pages, naming the result attributes id and numberofpages.",
      solution: "select distinct pubid as id, endpage - startpage + 1 as numberofpages from article" },
    { prompt: "For every book, produce a single column named citation of the form title (publisher, year) — e.g. \"Mathematical Logic (AMS, 1990)\".",
      solution: "select distinct title || ' (' || publisher || ', ' || year || ')' as citation from publication, book where publication.pubid = book.pubid" },
    { prompt: "For every journal, list its pubid (named id) and its age in full decades in the year 2026 (36 years old = 3 decades), named decades.",
      solution: "select distinct pubid as id, (2026 - year) / 10 as decades from journal" }
  ]
},

/* ============================================================ Lesson 5 */
{
  id: 5, part: PART1, type: "sql",
  title: "Set operations: UNION, EXCEPT, INTERSECT",
  showTables: ["wrote", "book", "journal", "proceedings", "article"],
  html: `
<p>A simple SELECT block can only express ∃,∧ (conjunctive) queries. For disjunction (∨) and
negation (¬) SQL uses <b>set operations</b> on query answers, which are relations (sets of
tuples):</p>

<p>• <code>Q1 UNION Q2</code> — tuples in Q1 <em>or</em> in Q2<br>
• <code>Q1 EXCEPT Q2</code> — tuples in Q1 but <em>not</em> in Q2 (“and not”)<br>
• <code>Q1 INTERSECT Q2</code> — tuples in <em>both</em> (redundant, rarely needed)</p>

<p>Q1 and Q2 must have <b>union-compatible</b> signatures: the same number and types of
attributes.</p>

<pre class="sql">select distinct pubid from book
union
select distinct pubid from journal</pre>

<pre class="out">PUBID
-----------
          1
          3

  2 record(s) selected.</pre>

<p class="note"><b>Note:</b> the slides (DB2) also allow wrapping each operand in
parentheses, as in <code>(select ...) union (select ...)</code>. SQLite, which runs these
exercises, does not — write the operands without parentheses. Chained set operations
associate left-to-right: <code>A union B except C</code> means
<code>(A union B) except C</code>.</p>

<h3>A common mistake: OR instead of UNION</h3>

<p>From lecture — this query looks like it computes all titles of journals or books:</p>

<pre class="sql">select distinct title
from publication, book, journal
where publication.pubid = book.pubid
   or publication.pubid = journal.pubid</pre>

<p>It often works, but consider a database <em>with no books at all</em>: the FROM clause pairs
each publication with a book row and a journal row, and with no book rows there are no
combinations — the answer is <b>empty</b>, even if journals exist. Use <code>UNION</code>
for “or” across different tables.</p>
`,
  tasks: [
    { prompt: "List the pubids of journals or proceedings in which no article appears.",
      solution: "select pubid from journal union select pubid from proceedings except select appears_in from article" },
    { prompt: "List the ids of authors who wrote at least one article but never wrote a book.",
      solution: "select author from wrote, article where publication = article.pubid except select author from wrote, book where publication = book.pubid" },
    { prompt: "List the pubids of books that have at least one author.",
      solution: "select pubid from book intersect select publication from wrote" }
  ]
},

/* ============================================================ Lesson 6 */
{
  id: 6, part: PART1, type: "sql",
  title: "Naming queries: WITH and subqueries in FROM",
  showTables: ["publication", "wrote", "book", "journal", "proceedings"],
  html: `
<p>Queries denote relations, so SQL lets you <b>name</b> the result of a query and use the name
later in place of a base table. What if you need a set operation <em>inside</em> a SELECT
block? You could rewrite using distributive laws — often very cumbersome — or simply name the
subquery. The <code>WITH</code> construct (a <em>common table expression</em>) does exactly
this:</p>

<pre class="sql">WITH T1 [(&lt;schema&gt;)] AS ( &lt;query-1&gt; ),
     ...
     Tn [(&lt;schema&gt;)] AS ( &lt;query-n&gt; )
&lt;query-that-uses-T1-to-Tn-as-table-names&gt;</pre>

<p>Example from lecture — all publication titles for books or journals:</p>

<pre class="sql">with bookorjournal (pubid) as (
     select distinct pubid from book
     union
     select distinct pubid from journal )
select distinct title
from publication, bookorjournal
where publication.pubid = bookorjournal.pubid</pre>

<pre class="out">TITLE
-------------------------
Mathematical Logic
Trans. on Databases

  2 record(s) selected.</pre>

<p>Naming every subexpression is sometimes inconvenient, so SQL-92 also permits
<b>inlining</b> queries directly in the FROM clause. Unlike for base tables, the correlation
name is <em>mandatory</em> here:</p>

<pre class="sql">select distinct title
from publication, (
     select distinct pubid from book
     union
     select distinct pubid from journal ) as jb
where publication.pubid = jb.pubid</pre>
`,
  tasks: [
    { prompt: "Using WITH, define multi(pubid) as the publications with at least two different authors, then list the titles of all multi-author books.",
      solution: "with multi (pubid) as ( select distinct r1.publication from wrote r1, wrote r2 where r1.publication = r2.publication and r1.author != r2.author ) select distinct title from publication, multi, book where publication.pubid = multi.pubid and multi.pubid = book.pubid" },
    { prompt: "Using a subquery inlined in the FROM clause, list the titles of all journals or proceedings.",
      solution: "select distinct title from publication, ( select pubid from journal union select pubid from proceedings ) as jp where publication.pubid = jp.pubid",
      hint: "Unlike for base tables, the correlation name on the inlined subquery is mandatory." }
  ]
},

/* ============================================================ Lesson 7 */
{
  id: 7, part: PART1, type: "sql",
  title: "Nested queries: IN, NOT IN, SOME and ALL",
  showTables: ["publication", "wrote", "author", "article", "journal"],
  html: `
<p>SQL also allows conditions in the <code>WHERE</code> clause to be expressed with
<b>subqueries</b> — analogous to nesting of quantifiers in relational calculus conditions.
This simplifies writing queries with negation and can make code more readable, but beware:
the semantics get complicated when duplicates are involved, and it is <em>very</em> easy to
make mistakes.</p>

<p>The forms that relate a value to a subquery are:</p>

<pre class="sql">&lt;attr&gt; IN ( &lt;query&gt; )          -- value appears in the subquery
&lt;attr&gt; NOT IN ( &lt;query&gt; )      -- value absent from the subquery
&lt;attr&gt; op SOME ( &lt;query&gt; )     -- relates to at least one value
&lt;attr&gt; op ALL ( &lt;query&gt; )      -- relates to all values</pre>

<p>In these forms the subquery must be <em>unary</em> (produce a single column).</p>

<pre class="sql">select distinct title
from publication
where pubid in ( select pubid from article )</pre>

<pre class="out">TITLE
-------------------------
Query Languages

  1 record(s) selected.</pre>

<p>Nesting in the WHERE clause is mere <b>syntactic sugar</b>: <code>where r.a in (select b
from s)</code> can always be rewritten as a join with <code>(select distinct b from s) as
s</code> in the FROM clause. Also note the equivalences
<code>= SOME</code> ≡ <code>IN</code> and <code>&lt;&gt; ALL</code> ≡ <code>NOT IN</code>.</p>

<p class="note"><b>Note:</b> SQLite (which runs these exercises) does not support
<code>SOME</code>/<code>ALL</code> — use the <code>IN</code>/<code>NOT IN</code> equivalences,
or aggregates like <code>max</code> (Lesson 9), which is how you would express “find the
longest article” without <code>&gt;= ALL</code>.</p>
`,
  tasks: [
    { prompt: "Get the titles of all publications written by Sue — starting from her name, not her id.",
      solution: "select distinct title from publication where pubid in ( select publication from wrote where author in ( select aid from author where name = 'Sue' ) )" },
    { prompt: "List the names of all authors who wrote nothing at all.",
      solution: "select distinct name from author where aid not in ( select author from wrote )" },
    { prompt: "Get the titles of all articles that appear in a journal (not in a proceedings).",
      solution: "select distinct title from publication where pubid in ( select pubid from article where appears_in in ( select pubid from journal ) )" }
  ]
},

/* ============================================================ Lesson 8 */
{
  id: 8, part: PART1, type: "sql",
  title: "Correlated subqueries: EXISTS and NOT EXISTS",
  showTables: ["wrote", "author", "publication"],
  html: `
<p>So far, subqueries have been <em>independent</em> of the main query. SQL also allows
<b>parametric</b> (correlated) subqueries that mention attributes of the main query. The truth
of the condition is determined for each candidate tuple of the main query: instantiate the
parameters, then evaluate the subquery. The most common use tests
emptiness/non-emptiness:</p>

<pre class="sql">EXISTS ( &lt;query&gt; )
NOT EXISTS ( &lt;query&gt; )</pre>

<p>Authorships of publications that have another author too:</p>

<pre class="sql">select * from wrote r
where exists ( select *
      from wrote s
      where r.publication = s.publication
      and r.author &lt;&gt; s.author )</pre>

<pre class="out">AUTHOR      PUBLICATION
----------- -----------
          1           2
          2           2

  2 record(s) selected.</pre>

<p>Complementing the condition is now easy — replace <code>exists</code> with
<code>not exists</code> to get the authorships where the author wrote it <em>alone</em>.</p>

<p>Subqueries can nest repeatedly, and every level can use attributes of enclosing queries as
parameters — correct naming is imperative. A classic pattern expresses
“<em>all x in R such that (a part of) x doesn't appear in S</em>”. From lecture, authors who
<b>always</b> publish with someone else:</p>

<pre class="sql">select distinct a1.name
from author a1, author a2
where not exists (
      select *
      from publication p, wrote w1
      where p.pubid = w1.publication
      and a1.aid = w1.author
      and a2.aid not in (
            select author from wrote
            where publication = p.pubid
            and author &lt;&gt; a1.aid ) )</pre>

<pre class="out">NAME
----------
John

  1 record(s) selected.</pre>

<p class="note"><b>Remember:</b> WHERE subqueries only stand for <em>conditions</em> — they
CANNOT be used to produce results. Attributes present only in the subquery cannot appear in
the main query's SELECT clause.</p>
`,
  tasks: [
    { prompt: "List the titles of all publications written by exactly one author.",
      solution: "select distinct title from publication p, wrote w where p.pubid = w.publication and not exists ( select * from wrote w2 where w2.publication = w.publication and w2.author <> w.author )" },
    { prompt: "List the names of authors who wrote at least two different publications.",
      solution: "select distinct name from author a where exists ( select * from wrote w1, wrote w2 where w1.author = a.aid and w2.author = a.aid and w1.publication != w2.publication )" },
    { prompt: "Challenge: list the names of authors none of whose publications is single-authored.",
      solution: "select distinct name from author a where not exists ( select * from wrote w where w.author = a.aid and not exists ( select * from wrote w2 where w2.publication = w.publication and w2.author <> w.author ) )",
      hint: "Doubly-nested NOT EXISTS: no publication of a exists that has no other author. An author with zero publications satisfies this vacuously — they belong in the answer." },
    { prompt: "Challenge: list the names of authors who wrote every publication that Ana wrote.",
      solution: "select distinct name from author a where not exists ( select * from wrote w1 where w1.author = ( select aid from author where name = 'Ana' ) and not exists ( select * from wrote w2 where w2.author = a.aid and w2.publication = w1.publication ) )",
      hint: "Relational division: \"for all publications p of Ana: a wrote p\" becomes \"no publication of Ana exists that a did not write\". Ana trivially qualifies." }
  ]
},

/* ============================================================ Lesson 9 */
{
  id: 9, part: PART1, type: "sql",
  title: "Aggregate queries and GROUP BY",
  showTables: ["author", "wrote", "article", "book"],
  html: `
<p><b>Aggregation</b> is a standard and very useful extension of first-order queries — except
for min/max, aggregates usually cannot be expressed in the relational calculus at all. The
aggregate (column) functions are <code>count(*)</code>, <code>count(e)</code>,
<code>sum(e)</code>, <code>min(e)</code>, <code>max(e)</code> and <code>avg(e)</code>, and
they can apply to <em>groups of tuples</em> that agree on selected attributes:</p>

<pre class="sql">SELECT x1,...,xk, agg1 [AS n1], ..., aggj [AS nj]
&lt;FROM-WHERE&gt;
[GROUP BY x1,...,xk]</pre>

<p><b>Restriction:</b> every attribute in the SELECT clause that is <em>not</em> inside an
aggregate function <b>must</b> appear in the GROUP BY clause.</p>

<p>The <b>operational reading</b> from lecture:</p>
<p>1. Partition the result of &lt;FROM-WHERE&gt; into the smallest number of groups with equal
values of the grouping attributes (a single group if there is no GROUP BY);<br>
2. apply the aggregate functions on each partition;<br>
3. output one tuple per group: the grouping values plus the aggregate results.</p>

<pre class="sql">select publication, count(author)
from wrote
group by publication</pre>

<pre class="out">PUBLICATION 2
----------- -----------
          1           1
          2           2
          4           1

  3 record(s) selected.</pre>

<p>Aggregates combine with joins. For each author, the count of article pages (slide 58):</p>

<pre class="sql">select author, sum(endpage - startpage + 1) as pcnt
from wrote, article
where publication = pubid
group by author</pre>

<pre class="out">AUTHOR      PCNT
----------- -----------
          1          12

  1 record(s) selected.</pre>

<p><em>Not quite correct</em>, notes the lecture: author 2 wrote no articles, so they vanish
from the answer instead of being reported with 0 pages. Fixing this needs an outer join
(Lesson 21).</p>
`,
  tasks: [
    { prompt: "For each venue (appears_in value), the number of articles appearing in it, named artcnt.",
      solution: "select appears_in, count(*) as artcnt from article group by appears_in" },
    { prompt: "For each author name, the number of publications they wrote, named pcnt.",
      solution: "select name, count(publication) as pcnt from author, wrote where aid = author group by name",
      hint: "Join then group. Authors who wrote nothing silently disappear — fixing that needs the outer join of Lesson 21." },
    { prompt: "In one query: the average article length in pages, named avglen.",
      solution: "select avg(endpage - startpage + 1) as avglen from article" },
    { prompt: "In one query: the earliest and latest book year, named first and last.",
      solution: "select min(year) as first, max(year) as last from book" },
    { prompt: "Find the pubid and length (named len) of the longest article.",
      solution: "select distinct pubid, endpage - startpage + 1 as len from article where endpage - startpage = ( select max(endpage - startpage) from article )",
      hint: "Compare against a subquery computing the max — the SOME/ALL workaround from Lesson 7." }
  ]
},

/* =========================================================== Lesson 10 */
{
  id: 10, part: PART1, type: "sql",
  title: "The HAVING clause",
  showTables: ["wrote", "publication", "book", "author", "article"],
  html: `
<p>The <code>WHERE</code> clause cannot impose conditions on aggregate values — WHERE
conditions are applied <em>before</em> GROUP BY. To filter <em>groups</em>, SQL introduces the
<code>HAVING</code> clause: like WHERE, but for aggregate values. The aggregate functions used
in HAVING may even differ from those in the SELECT clause; the grouping is common.</p>

<pre class="sql">select publication, count(author) as acnt
from wrote
group by publication
having count(author) &gt; 1</pre>

<pre class="out">PUBLICATION ACNT
----------- -----------
          2           2

  1 record(s) selected.</pre>

<p>HAVING is again just <em>syntactic sugar</em>: it can always be replaced by a nested query
in the FROM clause plus an ordinary WHERE. (Lecture exercise — try rewriting the query above
that way!)</p>

<p>Everything combines. From lecture: for each author, the id, name, and count of the number
of books and articles they wrote:</p>

<pre class="sql">select distinct aid, name, count(publication) as pubcnt
from author, (
     select distinct author, publication
     from wrote, book
     where publication = pubid
     union
     select distinct author, publication
     from wrote, article
     where publication = pubid ) ba
where aid = ba.author
group by aid, name</pre>

<pre class="out">AID         NAME       PUBCNT
----------- ---------- -----------
          1 Sue                  2

  1 record(s) selected.</pre>
`,
  tasks: [
    { prompt: "List the publishers that published more than one book, with the count named bcnt.",
      solution: "select publisher, count(*) as bcnt from book group by publisher having count(*) > 1" },
    { prompt: "List the ids of authors who wrote more than two publications, with the count named pcnt.",
      solution: "select author, count(publication) as pcnt from wrote group by author having count(publication) > 2" },
    { prompt: "For each publication with at least two authors, its title and author count named acnt.",
      solution: "select title, count(author) as acnt from publication, wrote where pubid = publication group by pubid, title having count(author) >= 2" },
    { prompt: "Challenge: for each author who wrote at least one book or article, list aid, name, and the number of such publications as pubcnt.",
      solution: "select distinct aid, name, count(publication) as pubcnt from author, ( select distinct author, publication from wrote, book where publication = pubid union select distinct author, publication from wrote, article where publication = pubid ) ba where aid = ba.author group by aid, name" }
  ]
},

/* =========================================================== Lesson 11 */
{
  id: 11, part: PART1, type: "sql", dml: true,
  title: "Modifying data: INSERT, DELETE, UPDATE",
  showTables: ["author", "wrote", "book", "article", "proceedings"],
  html: `
<p>SQL has supported small-scale incremental update since inception — required by
<em>on-line transaction processing</em> (OLTP) systems like reservations and electronic funds
transfer. There are three kinds of table update:</p>

<h3>INSERT</h3>
<pre class="sql">INSERT INTO T [(A1, ..., Ak)] VALUES (c1, ..., ck)   -- one constant tuple
INSERT INTO T (Q)                                    -- each tuple computed by query Q</pre>

<pre class="sql">insert into author (aid, name)
values (4, 'Martha')</pre>

<p>Inserting with a query lets you compute values, e.g. a fresh id:</p>

<pre class="sql">insert into author
select max(aid) + 1, 'Tim' from author</pre>

<h3>DELETE</h3>
<pre class="sql">DELETE FROM T WHERE &lt;condition&gt;</pre>
<p>deletes <em>all</em> tuples that match the condition (conditions can contain subqueries).</p>

<h3>UPDATE</h3>
<pre class="sql">UPDATE T
SET &lt;assignments&gt;
WHERE &lt;condition&gt;</pre>
<p>updates <em>in place</em> all tuples satisfying the condition.</p>

<h3>Transactions</h3>
<p>The DBMS guarantees noninterference (serializability) of all data manipulation within the
scope of a <b>transaction</b> (the ACID properties). A transaction starts with the first access
and ends with either <code>COMMIT</code> (make changes permanent) or <code>ROLLBACK</code>
(discard changes). Try it here: run
<code>begin; delete from wrote; rollback; select * from wrote</code> in one go and check that
WROTE is intact.</p>

<p class="note"><b>How checking works here:</b> every run starts from a <em>fresh</em> copy of
the database, then your statement(s) are applied and the resulting state is checked — so each
task is independent, and half-typed statements can't wreck anything. After a data-changing
statement, the console shows the affected table's <em>new</em> contents, so you can see
exactly what your INSERT, DELETE or UPDATE did.</p>
`,
  tasks: [
    { prompt: "Add Martha as a new author, with a new unique identification computed as max(aid) + 1.",
      solution: "insert into author select max(aid) + 1, 'Martha' from author",
      verify: "select aid, name from author" },
    { prompt: "Record Sue — looking her id up by her name — as the author of every book that currently has no author at all.",
      solution: "insert into wrote select a.aid, b.pubid from author a, book b where a.name = 'Sue' and b.pubid not in ( select publication from wrote )",
      verify: "select * from wrote" },
    { prompt: "Delete all articles shorter than 10 pages.",
      solution: "delete from article where endpage - startpage + 1 < 10",
      verify: "select * from article" },
    { prompt: "The proceedings volumes were reprinted with a 100-page front matter: increase by 100 the startpage and endpage of every article that appears in a proceedings.",
      solution: "update article set startpage = startpage + 100, endpage = endpage + 100 where appears_in in ( select pubid from proceedings )",
      verify: "select * from article" }
  ]
},

/* =========================================================== Lesson 12 */
{
  id: 12, part: PART1, type: "sql", dml: true,
  title: "Creating tables: DDL and integrity constraints",
  showTables: ["author"],
  html: `
<p>The SQL <b>DDL</b> (data definition language) defines relational schemata: tables and their
basic integrity constraints. From lecture, part of the bibliography schema as DDL requests:</p>

<pre class="sql">create table AUTHOR (
    aid integer not null,
    name varchar(10) not null,
    primary key (aid) )

create table WROTE (
    author integer not null,
    publication integer not null,
    primary key (author, publication),
    foreign key (author) references AUTHOR,
    foreign key (publication) references PUBLICATION )</pre>

<p>These include four very common varieties of integrity constraints:</p>
<p>1. <b>data type constraints</b> for each column;<br>
2. <code>not null</code> constraints (strongly desired for each column);<br>
3. <code>primary key</code> constraints — a key may span several columns, as in WROTE; and<br>
4. <code>foreign key</code> constraints — values must appear as key values in the referenced
table.</p>

<p>A <b>domain constraint</b> in the form of an SQL data type must be given for each attribute.
The basic types from lecture:</p>

<pre class="out">integer         integer (32 bit)
smallint        integer (16 bit)
decimal(m,n)    fixed decimal
float           IEEE float (32 bit)
char(n)         character string (length n)
varchar(n)      variable length string (at most n)
date            year/month/day
time            hh:mm:ss.ss</pre>
`,
  tasks: [
    { prompt: "Create a table PARTS with columns pid (integer, not null) and pname (varchar(20), not null), with pid as primary key.",
      solution: "create table parts ( pid integer not null, pname varchar(20) not null, primary key (pid) )",
      verify: "select * from parts", checkColumns: true },
    { prompt: "Create a table SUPPLIES with columns sid, pid and quantity (all integer, not null), primary key (sid, pid), and a foreign key on pid referencing PARTS.",
      solution: "create table supplies ( sid integer not null, pid integer not null, quantity integer not null, primary key (sid, pid), foreign key (pid) references parts )",
      verify: "select * from supplies", checkColumns: true },
    { prompt: "Create a table REVIEW with columns aid, pubid (both integer, not null) and score (smallint, not null), primary key (aid, pubid), and foreign keys referencing AUTHOR and PUBLICATION.",
      solution: "create table review ( aid integer not null, pubid integer not null, score smallint not null, primary key (aid, pubid), foreign key (aid) references author, foreign key (pubid) references publication )",
      verify: "select * from review", checkColumns: true }
  ]
},

/* =========================================================== Lesson 13 */
{
  id: 13, part: PART2, type: "reading",
  title: "Why relational algebra? Query evaluation",
  html: `
<p>SQL is <em>declarative</em>: a query says what the answer should be, not how to compute it.
So how does a relational database system actually evaluate a query? The lecture's picture is
the <b>two-tier (client/server) architecture</b>: applications with database clients talk to a
database server, which sits on a file system. The server is responsible for DDL evaluation,
DML compilation (<em>selection of a query plan</em>), DML execution, concurrency control, and
buffer management (rollback and failure recovery).</p>

<p>The steps in evaluating a query Q are:</p>

<p>1. <b>Parsing</b>, view expansion, and type and authorization checking of Q;<br>
2. <b>Translation</b> of Q to a formulation E<sub>Q</sub> in the <b>relational algebra</b>;<br>
3. <b>Optimization</b> of E<sub>Q</sub> — generates an efficient <em>query plan</em>
P<sub>Q</sub>, using statistical metadata about the database instance;<br>
4. <b>Execution</b> of P<sub>Q</sub> — uses access methods to access stored relations and
physical relational operators to combine them.</p>

<p>Relational algebra is the basis for the implementation of SQL. It provides the connection
between the conceptual and physical levels, expresses query execution in (easily) manageable
pieces, allows the use of efficient algorithms and data structures, and provides a mechanism
for <em>query optimization</em> based on logical transformations.</p>

<p>Where the relational calculus (and SQL) describes answers by a <em>condition</em>, the
relational algebra builds answers by applying a small set of <b>operations</b> on relations —
each operation takes relations as input and produces a relation. The next lessons introduce
these operations one at a time, and let you evaluate real algebra expressions.</p>
`,
  tasks: [
    { quiz: true,
      prompt: "In query evaluation, an SQL query is first translated into which formalism before being optimized into a query plan?",
      choices: ["Relational calculus", "Relational algebra", "A physical access plan directly", "Datalog"],
      answer: 1 },
    { quiz: true,
      prompt: "Which component of the two-tier architecture selects a query plan for a query (DML compilation)?",
      choices: ["The application", "The database client", "The database server", "The file system"],
      answer: 2 },
    { quiz: true,
      prompt: "Query optimization generates an efficient plan from an algebra expression using what additional information?",
      choices: ["The SQL standard version", "Statistical metadata about the database instance", "The number of clients connected", "The order of clauses in the original SQL"],
      answer: 1 }
  ]
},

/* =========================================================== Lesson 14 */
{
  id: 14, part: PART2, type: "ra", raData: "bank",
  title: "Relational algebra: selection σ and projection π",
  html: `
<p>The <b>relational algebra</b> (RA) consists of a set of operations on finite relations. An
RA query is an expression E built from:</p>

<pre class="out">R                    relation name          (constants:  A = c   constant relation)
σ[Ai=Aj](E)          selection              (removes rows)
π[A1,...,Ak](E)      projection             (removes columns and duplicates)
ρ[A1,...,Ak](E)      rename
E1 × E2              cross product
E1 ∪ E2              union
E1 − E2              set difference</pre>

<p>We work with the ACCOUNT/BANK instance from lecture (shown below). The simplest expression
is a <b>relation name</b>: evaluating <code>ACCOUNT</code> yields all account information. A
<b>constant</b> like <code>amount = $10000</code> evaluates to a single-attribute,
single-tuple relation.</p>

<h3>Selection σ (removes rows)</h3>
<p>σ keeps the tuples satisfying a condition of the form attribute = attribute (or
attribute = constant). From lecture — all account information for accounts with a $10000
balance, using a constant relation and a cross product:</p>

<pre class="out">σ[balance=amount](ACCOUNT × (amount = $10000))

anum   type   balance   bank    bnum   amount
2000   BUS    $10000    Royal   5      $10000
2001   BUS    $10000    TD      3      $10000</pre>

<h3>Projection π (removes columns and duplicates)</h3>
<p>π keeps only the listed attributes — and, because relations are <em>sets</em>, duplicate
tuples disappear:</p>

<pre class="out">π[type,balance](ACCOUNT)

type   balance
CHK    $1000
SAV    $20000
CHK    $2500
BUS    $10000</pre>

<p>(Six accounts, but only four distinct type/balance combinations.)</p>

<p class="note"><b>Syntax in this console:</b> type expressions like
<code>pi[type,balance](sigma[bank=name](ACCOUNT x BANK))</code>. The buttons above the editor
insert the proper symbols σ π ρ × ∪ −; the ASCII words <code>sigma</code>, <code>pi</code>,
<code>rho</code>, <code>x</code>, <code>union</code>, <code>-</code> work too. A σ takes a
<em>single</em> comparison — to require two conditions at once, nest one σ inside another.</p>

<p class="note"><b>Note:</b> the console instance below extends the slide instance with more
accounts and banks, so the example outputs above (from the slides) differ from what you will
see when you run the same expressions here.</p>
`,
  tasks: [
    { prompt: "The anum and bank of all checking (CHK) accounts — the result should have exactly those two attributes.",
      solution: "pi[anum,bank](sigma[type=t](ACCOUNT x (t = CHK)))" },
    { prompt: "The distinct balances of all savings (SAV) accounts.",
      solution: "pi[balance](sigma[type=t](ACCOUNT x (t = SAV)))" },
    { prompt: "The anum of every account held at TD with a $2500 balance.",
      solution: "pi[anum](sigma[bank=b](sigma[balance=v](ACCOUNT x (v = $2500)) x (b = TD)))",
      hint: "Two conditions means nesting one σ inside another: cross with one constant relation, select, cross with the second, select again, then project." }
  ]
},

/* =========================================================== Lesson 15 */
{
  id: 15, part: PART2, type: "ra", raData: "bank",
  title: "Rename ρ and cross product ×",
  html: `
<p><b>Cross product ×</b> combines two relations: the result has the attributes of both, and
one tuple for every <em>pair</em> of tuples. Evaluating <code>ACCOUNT × BANK</code> over the
slide instance yields 6 × 2 = 12 tuples — every account paired with every bank, related or
not. (How many does the console instance below produce? Predict before you run it.)</p>

<p>To make a cross product meaningful, follow it with a <b>selection</b> that keeps the pairs
that belong together. This σ+× combination is how the algebra expresses a <em>join</em>. From
lecture — all account information including bank addresses:</p>

<pre class="out">σ[bank=name](ACCOUNT × BANK)

anum   type   balance   bank   bnum   name   address
1234   CHK    $1000     TD     1      TD     TD Centre
1235   SAV    $20000    TD     2      TD     TD Centre
1236   CHK    $2500     CIBC   1      CIBC   CIBC Tower
2001   BUS    $10000    TD     3      TD     TD Centre</pre>

<p>(Accounts at Royal disappear: Royal has no tuple in BANK to pair with.)</p>

<p><b>Rename ρ</b> gives new names to <em>all</em> the attributes of a relation, in order:</p>

<pre class="out">ρ[bname,addr](BANK)

bname   addr
TD      TD Centre
CIBC    CIBC Tower</pre>

<p>Renaming matters for two reasons: attribute names in a relation must be distinct, so a
relation cannot be crossed with itself without renaming one copy first (this console will
remind you); and set operations line up attributes by position, so ρ documents your intent.</p>
`,
  tasks: [
    { prompt: "The anum, balance, and bank address of every account whose bank appears in BANK — exactly those three attributes.",
      solution: "pi[anum,balance,address](sigma[bank=name](ACCOUNT x BANK))" },
    { prompt: "All ordered pairs of different bank names.",
      solution: "pi[n1,n2](sigma[n1!=n2](rho[n1,a1](BANK) x rho[n2,a2](BANK)))",
      hint: "A self cross product — ρ both copies of BANK to different attribute names first, cross, select with !=, project the two name attributes." },
    { prompt: "Challenge: all ordered pairs of different account numbers held at the same bank.",
      solution: "pi[x1,x2](sigma[x1!=x2](sigma[b1=b2](rho[x1,t1,v1,b1,n1](ACCOUNT) x rho[x2,t2,v2,b2,n2](ACCOUNT))))",
      hint: "ρ must rename ALL five attributes of each ACCOUNT copy. Join on equal bank, select different anums, project the pair." }
  ]
},

/* =========================================================== Lesson 16 */
{
  id: 16, part: PART2, type: "ra", raData: "bank",
  title: "Union ∪, difference −, and Codd's theorem",
  html: `
<p><b>Union ∪</b> and <b>set difference −</b> require union-compatible arguments (same number
and types of attributes). Union expresses “or”; difference expresses “and not”.</p>

<p>From lecture — the type and balance of all checking and savings accounts. Note how “CHK or
SAV” is built from a union of two <em>constant relations</em>, then joined by selection:</p>

<pre class="out">π[type,balance](σ[type=t](ACCOUNT × ((t = CHK) ∪ (t = SAV))))

type   balance
CHK    $1000
SAV    $20000
CHK    $2500</pre>

<p>And banks that appear in accounts but do not have addresses in BANK — a difference. The ρ
aligns the attribute names of the two sides:</p>

<pre class="out">π[bank](ACCOUNT) − ρ[bank](π[name](BANK))

bank
Royal</pre>

<h3>Codd's theorem</h3>
<p>Every range restricted relational calculus query has an equivalent RA query (and vice
versa): RA is a <b>relationally complete</b> query language. The translation maps ∧ with an
equality to σ, ∃ to π, ∨ to ∪, and ∧¬ to −. This is exactly why SQL (a calculus-style
language) can always be compiled into algebra for execution.</p>
`,
  tasks: [
    { prompt: "The type and balance of all checking (CHK) and savings (SAV) accounts.",
      solution: "pi[type,balance](sigma[type=t](ACCOUNT x ((t = CHK) union (t = SAV))))" },
    { prompt: "The names of banks used in accounts that do not have addresses in BANK.",
      solution: "pi[bank](ACCOUNT) - rho[bank](pi[name](BANK))" },
    { prompt: "The distinct balances that occur at TD but not at CIBC.",
      solution: "pi[balance](sigma[bank=b](ACCOUNT x (b = TD))) - pi[balance](sigma[bank=b](ACCOUNT x (b = CIBC)))" },
    { prompt: "Challenge: the account types held at both TD and Royal, using only the operators available (there is no ∩).",
      solution: "pi[type](sigma[bank=b](ACCOUNT x (b = TD))) - (pi[type](sigma[bank=b](ACCOUNT x (b = TD))) - pi[type](sigma[bank=b](ACCOUNT x (b = Royal))))",
      hint: "A ∩ B = A − (A − B): compute T = types at TD and R = types at Royal, then T − (T − R)." }
  ]
},

/* =========================================================== Lesson 17 */
{
  id: 17, part: PART2, type: "ra", raData: "bib",
  title: "Relational algebra practice (bibliography)",
  html: `
<p>These are the six <b>practice exercises</b> from the end of the relational algebra module,
posed over the bibliography schema. The relations (shown below) are now available in the
console: <code>AUTHOR</code>, <code>WROTE</code>, <code>PUBLICATION</code>, <code>BOOK</code>,
<code>JOURNAL</code>, <code>PROCEEDINGS</code>, <code>ARTICLE</code> and
<code>JOURNAL_OR_PROCEEDINGS</code>.</p>

<p>Remember the toolkit:</p>
<p>• join = cross product + selection: <code>σ[a=b](R × S)</code><br>
• when attribute names clash across ×, rename one side first with ρ<br>
• “without / no” = set difference −<br>
• requirements like “two different authors” need a self-join with ≠ (this console accepts
<code>!=</code> in selections)</p>

<p>For example, exercise 2 needs a join of PUBLICATION with JOURNAL_OR_PROCEEDINGS — but both
have a <code>pubid</code> attribute, so rename one:</p>

<pre class="out">π[title](σ[pubid=jp](PUBLICATION × ρ[jp](JOURNAL_OR_PROCEEDINGS)))</pre>
`,
  tasks: [
    { prompt: "1. What are all publication titles?",
      solution: "pi[title](PUBLICATION)" },
    { prompt: "2. What are the publication titles that are journals or proceedings?",
      solution: "pi[title](sigma[pubid=jp](PUBLICATION x rho[jp](JOURNAL_OR_PROCEEDINGS)))" },
    { prompt: "3. What are the titles of all books?",
      solution: "pi[title](sigma[pubid=bid](PUBLICATION x rho[bid,publisher,year](BOOK)))" },
    { prompt: "4. What are the publications (ids) without authors?",
      solution: "pi[pubid](PUBLICATION) - rho[pubid](pi[publication](WROTE))" },
    { prompt: "5. Challenge: what are all the ordered pairs of coauthor names?",
      solution: "pi[n1,n2](sigma[a2=aid2](sigma[a1=aid1](sigma[a1!=a2](sigma[p1=p2](rho[a1,p1](WROTE) x rho[a2,p2](WROTE))) x rho[aid1,n1](AUTHOR)) x rho[aid2,n2](AUTHOR)))",
      hint: "Self-join WROTE (renamed twice) on equal publication and different authors, then join each author id to AUTHOR (renamed) to get names." },
    { prompt: "6. Challenge: what are all publication titles written by a single author?",
      solution: "pi[title](sigma[pubid=p](PUBLICATION x rho[p](pi[publication](WROTE) - rho[publication](pi[p1](sigma[a1!=a2](sigma[p1=p2](rho[a1,p1](WROTE) x rho[a2,p2](WROTE))))))))",
      hint: "Publications with an author, minus publications with two different authors; then join with PUBLICATION for the titles." },
    { prompt: "7. Challenge: what are the names of authors who wrote an article but never a book?",
      solution: "pi[name](sigma[aid=a](AUTHOR x rho[a](pi[author](sigma[publication=ap](WROTE x rho[ap,ai,sp,ep](ARTICLE))) - pi[author](sigma[publication=bp](WROTE x rho[bp,pb,yr](BOOK))))))",
      hint: "Article-writing author ids minus book-writing author ids (rename ARTICLE/BOOK attributes to avoid the pubid clash), then join with AUTHOR for names." }
  ]
},

/* =========================================================== Lesson 18 */
{
  id: 18, part: PART3, type: "sql", dml: true,
  title: "Views and general integrity constraints",
  showTables: ["publication", "wrote", "book", "journal"],
  html: `
<p><b>General integrity constraints</b> go beyond keys and foreign keys. The SQL standard
provides assertions:</p>

<pre class="sql">CREATE ASSERTION &lt;assertion-name&gt; CHECK (&lt;condition&gt;)</pre>

<p>This delegates ensuring that the condition is <em>always true</em> to the RDBMS — a
transaction fails if it would make the condition false. Conditions with subqueries make
assertions at least as expressive as relational calculus constraints, e.g. a uniqueness
constraint (<em>equality generating dependency</em>) or a foreign key
(<em>tuple generating dependency</em>) can both be written as
<code>check ( not exists ( ... ) )</code>. However, subqueries in checks are not allowed by
most SQL engines (including DB2 — and SQLite here), so assertions remain mostly theory.</p>

<h3>Views</h3>

<pre class="sql">CREATE VIEW &lt;view-name&gt; AS (&lt;query&gt;)</pre>

<p>A view has many of the same properties as a table: its definition appears in the database
schema, access controls can be applied to it, other views can be defined in terms of it, and
it can be <b>queried as if it were a table</b>.</p>

<pre class="sql">create view pubswithauthors as
select distinct pubid, title, count(*) as acnt
from publication, wrote
where pubid = publication
group by pubid, title</pre>

<pre class="out">select * from pubswithauthors

PUBID       TITLE                      ACNT
----------- -------------------------- -----------
          1 Mathematical Logic                   1
          2 Principles of DB Systems             2
          4 Query Languages                      1

  3 record(s) selected.</pre>

<p>Unlike tables, only <em>some</em> views are <b>updatable</b>. According to SQL-92 a view is
updatable only if: it references exactly one table, outputs only simple attributes (no
expressions), and has no grouping/aggregation/DISTINCT, no nested queries, and no set
operations. These rules ensure updates to the view are <em>implicitly defined</em>; deciding
implicit definability in general is undecidable.</p>
`,
  tasks: [
    { prompt: "Create a view pubswithauthors with the ids, titles and author count (named acnt) of publications with at least one author. (The checker queries your view automatically; you can also select from it yourself.)",
      solution: "create view pubswithauthors as select distinct pubid, title, count(*) as acnt from publication, wrote where pubid = publication group by pubid, title",
      verify: "select * from pubswithauthors" },
    { prompt: "Create a view coauthors with columns a1, a2 holding every ordered pair of different author ids who coauthored a publication.",
      solution: "create view coauthors (a1, a2) as select distinct w1.author, w2.author from wrote w1, wrote w2 where w1.publication = w2.publication and w1.author != w2.author",
      verify: "select * from coauthors",
      hint: "View column names can be given in the definition: create view coauthors (a1, a2) as ..." },
    { prompt: "Create a view multiauthor: pubid, title and author count (acnt) of publications with more than one author.",
      solution: "create view multiauthor as select pubid, title, count(*) as acnt from publication, wrote where pubid = publication group by pubid, title having count(*) > 1",
      verify: "select * from multiauthor" }
  ]
},

/* =========================================================== Lesson 19 */
{
  id: 19, part: PART3, type: "sql",
  title: "Multiset (bag) semantics",
  showTables: ["wrote", "book", "article"],
  html: `
<p>SQL has always had a more general <b>multiset</b> (bag) semantics that <em>allows
duplicates</em>, in contrast to the simpler set semantics of the relational calculus: SQL
tables, views and query results are multisets of tuples. This was originally adopted for
efficiency — eliminating duplicates costs a sort or hash of the intermediate result.</p>

<p>Think of each table as having a hidden <em>repetition count</em> for every tuple.
Omitting <code>DISTINCT</code> keeps duplicates; adding it eliminates them. From lecture — for
every <em>ordered pair</em> of authorships on the same publication, the id of the
publication:</p>

<pre class="sql">select r1.publication
from wrote r1, wrote r2
where r1.publication = r2.publication
  and r1.author != r2.author</pre>

<pre class="out">PUBLICATION
-----------
          2
          2

  2 record(s) selected.</pre>

<p>Publication 2 appears twice — once for the pair (1,2) and once for (2,1). A publication
with n authors would produce O(n²) answers! The set operations also have multiset versions
that keep duplicates: <code>UNION ALL</code>, <code>EXCEPT ALL</code> and
<code>INTERSECT ALL</code>:</p>

<pre class="sql">select author from wrote, book
where publication = pubid
union all
select author from wrote, article
where publication = pubid</pre>

<pre class="out">AUTHOR
-----------
          1
          1

  2 record(s) selected.</pre>

<p>Sue (author 1) wrote both the book and the article, so she is listed twice.</p>

<p class="note"><b>Careful:</b> the rewriting of WHERE-subqueries into FROM-joins from Lesson
7 no longer holds if DISTINCT is dropped. Subqueries with duplicates in WHERE clauses do
<em>not</em> change the result of the outer query, but subqueries in WITH or FROM
<em>can</em>. (SQLite supports <code>UNION ALL</code> but not <code>EXCEPT ALL</code> /
<code>INTERSECT ALL</code>.)</p>
`,
  tasks: [
    { prompt: "For every ordered pair of different authorships on the same publication, list the publication id, keeping duplicates. Before running: predict how many rows a 3-author publication contributes.",
      solution: "select r1.publication from wrote r1, wrote r2 where r1.publication = r2.publication and r1.author != r2.author" },
    { prompt: "For every book and article, list its authors, keeping duplicates. Predict the number of rows first.",
      solution: "select author from wrote, book where publication = pubid union all select author from wrote, article where publication = pubid" },
    { prompt: "Same question but with duplicates eliminated — how many rows survive?",
      solution: "select author from wrote, book where publication = pubid union select author from wrote, article where publication = pubid" }
  ]
},

/* =========================================================== Lesson 20 */
{
  id: 20, part: PART3, type: "sql", setup: "uri",
  title: "NULL values and three-valued logic",
  showTables: ["author"],
  html: `
<p>A <code>NULL</code> can mean a value is <b>inapplicable</b> (Sue doesn't have a home phone)
or <b>unknown</b> (Sue has one, but we don't know it). Inapplicable values are essentially
poor schema design — the lecture's fix is decomposition into separate tables. Unknown values
lead to <em>possible worlds</em>: the certain answers to a query would be those true in
<b>all</b> worlds, but computing that is NP-hard to undecidable. SQL settles for an
approximation:</p>

<p>• <b>expressions:</b> a NULL parameter makes the result NULL
(<code>1 + NULL → NULL</code>);<br>
• <b>comparisons</b> with NULL return the third truth value <code>UNKNOWN</code>;<br>
• <b>set operations</b> treat NULL as just another (special) value;<br>
• <b>aggregates</b> do not count NULLs.</p>

<p>The boolean connectives get <em>extended truth tables</em> over TRUE/UNKNOWN/FALSE —
so e.g. <code>(x = 0) OR NOT (x = 0)</code> evaluates to UNKNOWN when x is NULL, not TRUE!
A WHERE clause keeps only rows where the condition <code>IS TRUE</code>; rows evaluating to
UNKNOWN are dropped. The extra predicates <code>IS NULL</code>, <code>IS TRUE</code>,
<code>IS FALSE</code>, <code>IS UNKNOWN</code> let you test explicitly.</p>

<p>For these lessons the AUTHOR table gained a <code>uri</code> column (slide 30), with
known values only for Mary and Emma:</p>

<pre class="sql">select aid, name from author
where uri is null</pre>

<pre class="out">AID         NAME
----------- ----------
          1 Sue
          2 John

  2 record(s) selected.</pre>

<p>And counting: <code>count(uri)</code> counts only non-NULL values while
<code>count(*)</code> counts rows:</p>

<pre class="sql">select count(*) as rcnt, count(uri) as vcnt
from author</pre>

<pre class="out">RCNT        VCNT
----------- -----------
          3           1

  1 record(s) selected.</pre>
`,
  tasks: [
    { prompt: "List all author ids and names for which we don't know the URL of their home page.",
      solution: "select aid, name from author where uri is null" },
    { prompt: "In one query: the number of authors (rcnt) and the number of known URIs (vcnt).",
      solution: "select count(*) as rcnt, count(uri) as vcnt from author" },
    { prompt: "List the names of all authors for whom uri = 'uwaterloo.ca' is not true (i.e., false or unknown).",
      solution: "select distinct name from author where uri is null or uri <> 'uwaterloo.ca'",
      hint: "WHERE keeps only rows where the condition IS TRUE, so plain uri <> '...' silently drops the NULL rows — add the IS NULL case explicitly." }
  ]
},

/* =========================================================== Lesson 21 */
{
  id: 21, part: PART3, type: "sql", setup: "uri",
  title: "Outer joins",
  showTables: ["author", "wrote"],
  html: `
<p>An ordinary join drops tuples that have no partner — recall the aggregation lesson, where
an author with no articles silently vanished from a page count. <b>Outer joins</b> allow
“NULL-padded” answers for tuples that fail to satisfy the join condition:</p>

<pre class="sql">FROM T1 &lt;j-type&gt; JOIN T2 ON &lt;cond&gt;</pre>

<p>where <code>&lt;j-type&gt;</code> is one of <code>INNER</code> (the ordinary join),
<code>LEFT</code> (keep unmatched tuples of T1, padding T2's attributes with NULL),
<code>RIGHT</code> (keep unmatched tuples of T2), or <code>FULL</code> (both).</p>

<pre class="sql">select aid, publication
from author left join wrote on aid = author</pre>

<pre class="out">AID         PUBLICATION
----------- -----------
          1           1
          1           2
          1           4
          2           2
          3           -

  5 record(s) selected.</pre>

<p>Mary (aid 3) wrote nothing, but she survives the join with a NULL publication. Combined
with the fact that aggregates do not count NULLs, this fixes counting queries — every author
gets a row, and Mary's count is a correct 0:</p>

<pre class="sql">select aid, count(publication) as pcnt
from author left join wrote on aid = author
group by aid</pre>

<pre class="out">AID         PCNT
----------- -----------
          1           3
          2           1
          3           0

  3 record(s) selected.</pre>
`,
  tasks: [
    { prompt: "List every author's aid, name and publication ids, keeping authors who wrote nothing.",
      solution: "select aid, name, publication from author left join wrote on aid = author" },
    { prompt: "For every author name, count their publications — authors without publications must appear with count 0.",
      solution: "select name, count(publication) as pcnt from author left join wrote on aid = author group by aid, name",
      hint: "count(publication) does not count NULLs, unlike count(*)." },
    { prompt: "Challenge: list the names of authors who wrote fewer than two publications, including those who wrote none.",
      solution: "select name from author left join wrote on aid = author group by aid, name having count(publication) < 2" }
  ]
},

/* =========================================================== Lesson 22 */
{
  id: 22, part: PART3, type: "sql", setup: "uri",
  title: "Ordering and limits",
  showTables: ["author", "article", "book"],
  html: `
<p><b>No particular ordering of the rows of a table can be assumed</b> when queries are
written — this is important! The same goes for intermediate results. It is, however, possible
to order the <em>final</em> result of a query with an <code>ORDER BY</code> clause at the end
of the query:</p>

<pre class="sql">ORDER BY e1 [ASC|DESC], ..., ek [ASC|DESC]</pre>

<p><code>ASC</code> (ascending) is the default; minor sorts, minor minor sorts, etc. can be
added after commas.</p>

<pre class="sql">select distinct * from author
order by name</pre>

<pre class="out">AID         NAME       URI
----------- ---------- --------------------
          2 John       -
          3 Mary       uwaterloo.ca
          1 Sue        -

  3 record(s) selected.</pre>

<p>The number of results can be <em>limited</em> by appending a <code>LIMIT</code> clause:</p>

<pre class="sql">&lt;query&gt; LIMIT e1 [ OFFSET e2 ]</pre>

<p>Its semantics is <b>non-deterministic</b>: the first e<sub>1</sub> answers <em>for some
total order</em> extending the result — and with OFFSET, the next e<sub>1</sub> answers
following the first e<sub>2</sub>. The semantics becomes deterministic <em>only when</em> the
query has an ORDER BY clause inducing a total order. Always pair LIMIT with ORDER BY.</p>
`,
  tasks: [
    { prompt: "List all authors in descending order of their name.",
      solution: "select distinct * from author order by name desc", ordered: true },
    { prompt: "List the pubid and length in pages (named len) of the three longest articles, longest first.",
      solution: "select pubid, endpage - startpage + 1 as len from article order by len desc limit 3", ordered: true },
    { prompt: "Books are shown two per page, ordered by year (oldest first): list the books on page 2.",
      solution: "select * from book order by year limit 2 offset 2", ordered: true }
  ]
},

/* =========================================================== Lesson 23 */
{
  id: 23, part: PART3, type: "reading",
  title: "Triggers and authorization",
  html: `
<p><b>Triggers</b> implement <em>event/condition/action</em> (ECA) rules: when an event
occurs and a condition holds, additional DML actions are added to the ongoing transaction that
triggered the rule. Simplified standard syntax from lecture:</p>

<pre class="sql">CREATE TRIGGER &lt;trigger-name&gt;
AFTER &lt;event&gt; ON &lt;table-or-view&gt;
    [ REFERENCING OLD AS &lt;correlation-old&gt; ]
    [ REFERENCING NEW AS &lt;correlation-new&gt; ]
    FOR EACH ROW [ WHEN &lt;condition&gt; ] BEGIN ATOMIC
        &lt;DML-action-1&gt;; ... &lt;DML-action-n&gt;;
    END</pre>

<p>where the event is <code>INSERT</code>, <code>DELETE</code>, or
<code>UPDATE OF &lt;attribute&gt;</code>. Example — when deleting an author, also delete
related WROTE tuples:</p>

<pre class="sql">create trigger delete_author
after delete on author
referencing old as a
for each row begin atomic
    delete from wrote where wrote.author = a.aid;
end</pre>

<p>Timing of integrity checking must be carefully managed (deferring all to COMMIT time always
works but impacts performance), and triggers make the SQL DML <b>Turing complete</b>.</p>

<h3>ECA rules in foreign keys</h3>
<p>Special syntax exists for common rules attached to foreign key constraints:</p>

<pre class="sql">FOREIGN KEY ( &lt;from-attribute-list&gt; )
REFERENCES &lt;table&gt; [ ( &lt;to-attribute-list&gt; ) ]
    [ ON DELETE &lt;action&gt; ]
    [ ON UPDATE &lt;action&gt; ]</pre>

<p>where the action is <code>RESTRICT</code> (produce an error), <code>CASCADE</code>
(propagate the delete), or <code>SET NULL</code> (set to “unknown”).</p>

<h3>Authorization</h3>
<p>The SQL DML includes a <em>data control language</em> (DCL) to manage access rights to
database objects by users and roles:</p>

<pre class="sql">GRANT  &lt;role&gt; TO &lt;user&gt;
GRANT  &lt;what&gt; ON &lt;object&gt; TO &lt;user-or-role&gt;
REVOKE &lt;role&gt; FROM &lt;user&gt;
REVOKE &lt;what&gt; ON &lt;object&gt; FROM &lt;user-or-role&gt;</pre>

<p>What can be granted: <code>CONNECT</code> on a database; <code>ALTER</code>,
<code>REFERENCES</code>, <code>SELECT</code>, <code>INSERT</code>, <code>DELETE</code> or
<code>UPDATE</code> on a table or view. <code>CREATE ROLE</code> creates roles, and
<code>DBADM</code> is a superuser. From lecture:</p>

<pre class="sql">create role PAT
grant connect on PAYROLL to PAT   -- PAT can access the PAYROLL database
grant select on EMPLOYEE to PAT   -- the team can query EMPLOYEE
grant PAT to Jim                  -- add Jim to the payroll project team</pre>
`,
  tasks: [
    { quiz: true,
      prompt: "A foreign key on WROTE.author references AUTHOR with ON DELETE CASCADE. What happens when an author row is deleted?",
      choices: ["The delete is rejected with an error", "Matching WROTE tuples are deleted too", "WROTE.author is set to NULL in matching tuples", "Nothing — the constraint only checks inserts"],
      answer: 1 },
    { quiz: true,
      prompt: "Triggers implement which kind of rules?",
      choices: ["Equality generating dependencies", "Event/condition/action (ECA) rules", "Access control rules", "Normalization rules"],
      answer: 1 },
    { quiz: true,
      prompt: "Which statement lets the payroll team member Jim query the EMPLOYEE table, given that role PAT already has select on EMPLOYEE?",
      choices: ["grant connect on PAYROLL to Jim", "grant select on PAT to Jim", "grant PAT to Jim", "revoke PAT from Jim"],
      answer: 2 }
  ]
}
];
