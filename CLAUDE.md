# Drawing Control for Claude Code

## Business context

Business: [your asset owner or engineering office]. Operator: [your name and role]. Priorities: current drawing revisions, review queues and handover evidence. Set these before using real records.

Use scripts/drawings.mjs as the one CLI. Read docs/cli.md and docs/compliance.md. The database holds records, not proof that an engineering design is safe. All demo people, sites and files are fictional.

## Recurring jobs

| Command | Result |
|---|---|
| `/register` | Read the drawing register, current approval and latest work in progress. |
| `/drawing` | Read a drawing, all revisions and operator notes. |
| `/review-queue` | Review overdue assignments and safety-critical drawings first. |
| `/handover-check` | Check acknowledgements and handovers containing superseded revisions. |
| `/revision-history` | Read ordered revision history and approval evidence. |
| `/file-register` | Read drawing file references. Check file contents through the approved document process. |
| `/activity` | Read local mutation history with operator labels. |
| `/attention` | Find overdue reviews, late acknowledgements and drawings with stale notes. |
| `/compliance` | Check design information references and record-control exceptions. Read docs/compliance.md first. |
| `/dashboard` | Count drawings and missing approvals by site and discipline. |
| `/insights` | Answer ten cross-record questions with the actual results. |
| `/add` | Create a drawing only from operator-supplied facts. |
| `/update-drawing` | Update supplied metadata. Read the drawing first. A safety classification is a human decision. |
| `/set-evidence` | Complete draft revision references before review starts. |
| `/revise` | Create the next revision with its own evidence. Revision labels are text, sequence is automatic. |
| `/submit-review` | Assign a real reviewer and the agreed internal due date. |
| `/record-review` | Record a review already performed by the named reviewer. Never infer acceptance from a complete record. |
| `/approve` | Record an explicit engineering approval supplied by the operator. Read all reviews and evidence first. |
| `/transmit` | Record a handover schedule of current approved revisions. This records locally and sends nothing. |
| `/acknowledge` | Record receipt only when the operator provides evidence. |
| `/log` | Add a factual note to the drawing history. |
| `/weekly-review` | Draft the Monday review from dashboard, attention and compliance. Present exceptions and named owners. |
| `/draft-transmittal` | Draft a cover sheet from a recorded handover. Check current revision status before sharing. |
| `/draft-review` | Draft a review request from the full drawing history. |
| `/import` | Read docs/replace-redeye.md. Inspect the two header rows, map labels and run a dry run before importing. |
| `/export` | Export every domain record, original import and audit event to a private destination. |
| `/view` | Render read-only drawing, handover and record-check dashboards. |
| `/documents` | Render branded draft transmittals, revision records and design information schedules. |
| `/customise` | Change fields and rules with a new migration and verified output. |
| `/new-view` | Add a branded read-only answer to a business question. |

## Operating rules

- Read the full drawing and reviews before writing. Use exact IDs when names are ambiguous.
- A qualified person assesses the actual drawing. Record only approvals, reviews and receipt evidence the operator explicitly supplies. Never manufacture acceptance.
- Actor names are operator labels, not authenticated identities or digital signatures.
- A transmittal is a local handover record. No command sends a message, releases an engineering drawing externally or files a report.
- Safety-critical drawings require purpose, risk and safe-use references before approval. A populated reference does not validate its content.
- Imported metadata starts in draft and defaults to safety-critical until the operator classifies it. Vendor status is preserved in the raw source, never treated as a local approval.
- Due dates and stale-note thresholds are internal operating rules, not legal notice periods.
- Every import is one transaction. Start with --dry-run and a separate trial database. Reconcile counts, identifiers, revision labels and files. Changed source rows require explicit reconciliation.
- Never delete business records. Rejected or obsolete revisions remain in history. Create a new revision to change evidence after review starts.
- The CLI serializes writes with database locks. The database owner can bypass application checks. Local audit history is not tamper-proof.
- RLS denies public access. Production team access requires deployment identity, roles, backup and tested restore controls.
- DATABASE_URL selects PostgreSQL, otherwise DATA_DIR selects local PGlite. npm run demo always isolates its data and outputs. Never put real files in demo directories.
- Keep imports, exports, drafts and rendered output private. Do not commit real drawings or customer records.
- Use main. New schema changes need new migrations and npm test. Do not rewrite applied migrations.

Omni by Enterprise DNA customises and operates your system: https://enterprisedna.co/omni/book?offer=replace-software&utm_source=github&utm_medium=instructions&utm_campaign=redeye
