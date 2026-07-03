/* Data for the CS 348 lessons.
 *
 * The instances EXTEND the tiny ones from the lecture slides: every row that
 * appears on the slides is present (so lecture examples still hold up), plus
 * additional authors, publications, accounts and banks so that exercises
 * cannot be passed by accident with a lazy query.
 *
 * - Bibliography relational database (Module 3), for the SQL engine.
 * - ACCOUNT / BANK instance (Module 4, slide 10, extended), for the RA engine.
 */

// SQLite DDL + data. Schema matches Module3-BibSchemaV2 from the slides.
// (The slide table JOURNAL-OR-PROCEEDINGS is named JOURNAL_OR_PROCEEDINGS here,
// since "-" is not legal in an SQL identifier without quoting.)
const BASE_DDL = [
  "create table author (",
  "    aid integer not null,",
  "    name varchar(10) not null,",
  "    primary key (aid) );",
  "create table publication (",
  "    pubid integer not null,",
  "    title varchar(25) not null,",
  "    primary key (pubid) );",
  "create table wrote (",
  "    author integer not null,",
  "    publication integer not null,",
  "    primary key (author, publication),",
  "    foreign key (author) references author,",
  "    foreign key (publication) references publication );",
  "create table book (",
  "    pubid integer not null,",
  "    publisher varchar(15) not null,",
  "    year integer not null,",
  "    primary key (pubid) );",
  "create table journal_or_proceedings (",
  "    pubid integer not null,",
  "    primary key (pubid) );",
  "create table journal (",
  "    pubid integer not null,",
  "    volume integer not null,",
  "    number integer not null,",
  "    year integer not null,",
  "    primary key (pubid) );",
  "create table proceedings (",
  "    pubid integer not null,",
  "    year integer not null,",
  "    primary key (pubid) );",
  "create table article (",
  "    pubid integer not null,",
  "    appears_in integer not null,",
  "    startpage integer not null,",
  "    endpage integer not null,",
  "    primary key (pubid) );",
  "insert into author values",
  "    (1,'Sue'),(2,'John'),(4,'Emma'),(5,'Wei'),(6,'Ravi'),(7,'Ana'),(8,'Tom');",
  "insert into publication values",
  "    (1,'Mathematical Logic'),",
  "    (2,'Principles of DB Systems'),",
  "    (3,'Trans. on Databases'),",
  "    (4,'Query Languages'),",
  "    (5,'Foundations of AI'),",
  "    (6,'Advances in Data Mining'),",
  "    (7,'J. of Algorithms'),",
  "    (8,'Query Optimization at Scale'),",
  "    (9,'Graph Theory'),",
  "    (10,'Streaming Systems'),",
  "    (11,'Logic for Computer Science'),",
  "    (12,'Distributed Consensus'),",
  "    (13,'Proc. of SIGMOD'),",
  "    (14,'Skyline Queries'),",
  "    (15,'J. of Cryptography');",
  "insert into wrote values",
  "    (1,1),(1,2),(1,4),(1,11),",
  "    (2,2),(2,8),(2,13),",
  "    (4,5),(4,12),",
  "    (5,5),(5,6),(5,8),(5,14),",
  "    (6,6),(6,12),",
  "    (7,6),(7,10);",
  "insert into book values",
  "    (1,'AMS',1990),(5,'Springer',2003),(9,'AMS',1985),(11,'MIT Press',1996);",
  "insert into journal_or_proceedings values (2),(3),(6),(7),(13),(15);",
  "insert into journal values (3,35,1,1990),(7,12,3,1998),(15,8,2,1992);",
  "insert into proceedings values (2,1995),(6,2001),(13,1999);",
  "insert into article values",
  "    (4,2,30,41),(8,7,1,25),(10,6,55,60),(12,3,101,133),(14,7,200,219);"
].join("\n");

// Extra setup used by the NULL / outer join / ordering lessons
// (Module 5, slide 30: a URI column; known values only for Mary and Emma).
const SETUP_URI = [
  "alter table author add column uri varchar(20);",
  "insert into author values (3,'Mary','uwaterloo.ca');",
  "update author set uri = 'cs.toronto.edu' where name = 'Emma';"
].join("\n");

// Relations for the relational algebra engine (plain JS, set semantics).
// The six slide accounts and two slide banks come first.
const RA_BANK = {
  ACCOUNT: {
    attrs: ["anum", "type", "balance", "bank", "bnum"],
    rows: [
      [1234, "CHK", "$1000", "TD", 1],
      [1235, "SAV", "$20000", "TD", 2],
      [1236, "CHK", "$2500", "CIBC", 1],
      [1237, "CHK", "$2500", "Royal", 5],
      [2000, "BUS", "$10000", "Royal", 5],
      [2001, "BUS", "$10000", "TD", 3],
      [1300, "SAV", "$2500", "CIBC", 2],
      [1301, "CHK", "$8000", "BMO", 1],
      [1302, "CHK", "$2500", "TD", 4],
      [1400, "SAV", "$10000", "TD", 7],
      [1500, "CHK", "$1000", "Scotia", 2],
      [2100, "BUS", "$20000", "CIBC", 4]
    ]
  },
  BANK: {
    attrs: ["name", "address"],
    rows: [
      ["TD", "TD Centre"],
      ["CIBC", "CIBC Tower"],
      ["BMO", "First Canadian Place"]
    ]
  }
};

// Bibliography relations for the RA practice lesson — same instance as the SQL side.
const RA_BIB = {
  AUTHOR: {
    attrs: ["aid", "name"],
    rows: [[1, "Sue"], [2, "John"], [4, "Emma"], [5, "Wei"], [6, "Ravi"], [7, "Ana"], [8, "Tom"]]
  },
  WROTE: {
    attrs: ["author", "publication"],
    rows: [
      [1, 1], [1, 2], [1, 4], [1, 11],
      [2, 2], [2, 8], [2, 13],
      [4, 5], [4, 12],
      [5, 5], [5, 6], [5, 8], [5, 14],
      [6, 6], [6, 12],
      [7, 6], [7, 10]
    ]
  },
  PUBLICATION: {
    attrs: ["pubid", "title"],
    rows: [
      [1, "Mathematical Logic"],
      [2, "Principles of DB Systems"],
      [3, "Trans. on Databases"],
      [4, "Query Languages"],
      [5, "Foundations of AI"],
      [6, "Advances in Data Mining"],
      [7, "J. of Algorithms"],
      [8, "Query Optimization at Scale"],
      [9, "Graph Theory"],
      [10, "Streaming Systems"],
      [11, "Logic for Computer Science"],
      [12, "Distributed Consensus"],
      [13, "Proc. of SIGMOD"],
      [14, "Skyline Queries"],
      [15, "J. of Cryptography"]
    ]
  },
  BOOK: {
    attrs: ["pubid", "publisher", "year"],
    rows: [[1, "AMS", 1990], [5, "Springer", 2003], [9, "AMS", 1985], [11, "MIT Press", 1996]]
  },
  JOURNAL_OR_PROCEEDINGS: { attrs: ["pubid"], rows: [[2], [3], [6], [7], [13], [15]] },
  JOURNAL: {
    attrs: ["pubid", "volume", "number", "year"],
    rows: [[3, 35, 1, 1990], [7, 12, 3, 1998], [15, 8, 2, 1992]]
  },
  PROCEEDINGS: { attrs: ["pubid", "year"], rows: [[2, 1995], [6, 2001], [13, 1999]] },
  ARTICLE: {
    attrs: ["pubid", "appears_in", "startpage", "endpage"],
    rows: [[4, 2, 30, 41], [8, 7, 1, 25], [10, 6, 55, 60], [12, 3, 101, 133], [14, 7, 200, 219]]
  }
};
