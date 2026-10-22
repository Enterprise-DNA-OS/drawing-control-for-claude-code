# Drawing Control for Claude Code

Your engineering drawing register, revision reviews and handovers in a database you own. Free MIT code from Enterprise DNA. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free code. Install and run the demo. Hosting and coding-agent costs are yours. | Your drawing fields, review rules, archive connections and screens. [Get your version built](https://enterprisedna.co/omni/book?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=redeye). | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=redeye). |

## The drawing-control desk

Run a weekly register review, chase overdue engineering reviews, check design-information references, identify recipients holding superseded revisions, and prepare handover paperwork. The database holds records and file references. Qualified people assess actual drawings and supply approval evidence.

This is a focused engineering drawing register, not a CAD editor or the whole RedEye platform. It requires no OAuth service or web server. Read [why no front end](docs/why-no-front-end.md) for the operating boundary.

Accruent lists RedEye Core at US$16,000 a year, Advanced at US$48,000 and Enterprise at US$80,000. These are indicative vendor prices with artefact costs and configuration caveats, not verified customer invoices. [Vendor pricing](https://www.accruent.com/product-pricing), checked 22 October 2026.

## Quick start

Node 20 or newer. No database server needed for the local demo.

```bash
git clone https://github.com/Enterprise-DNA-OS/drawing-control-for-claude-code.git
cd drawing-control-for-claude-code
npm install
npm test
npm run demo
```

The demo isolates its data under .data/demo and its output under .data/demo-output, even when DATABASE_URL is set. All people, sites and files are fictional. It includes an overdue safety-critical review, a missing file reference and a handover containing a superseded drawing.

For more demo queries on Bash, use DATA_DIR=.data/demo before the command. On PowerShell, set $env:DATA_DIR='.data/demo'. For real records choose a fresh directory, run npm run migrate, then import without seeding. Read [CLI reference](docs/cli.md).

## Commands

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

## Ten questions across your records

1. Which safety-critical drawings have an overdue review and missing design information?
2. Which recipients still hold a superseded drawing revision?
3. Which sites have drawings without an approved revision?
4. Which reviewers have the largest overdue queue?
5. Which assets have several drawings but no approved revision for at least one?
6. Which approved revisions have never appeared in a handover?
7. Which drawings have both an approved revision and newer work in progress?
8. Which unacknowledged handovers are overdue and contain superseded drawings?
9. Which drawing owners have a note older than fourteen days?
10. Which imported drawings still need their first local review?

Every question runs today through the insights command. These combine your revision and handover records; they are not a claim that a configured RedEye report can never answer the same question.

## Your first hour: ten things to ask for

1. Show the drawing register for each site.
2. Show the full history of DW-101.
3. Which engineering reviews are overdue?
4. Who still holds a superseded revision?
5. Which safety-critical drawings lack design-information references?
6. Draft a handover cover sheet for TX-101.
7. Draft the Monday review from the current records.
8. Import my RedEye metadata after a trial run.
9. Add our drawing coordinator field and show it in the register.
10. Add a read-only view of our overdue reviews by discipline.

## Records, documents and controls

npm run docs produces branded draft transmittal covers, revision records and design-information schedules. npm run view renders the week, handover watch and compliance findings. Set business name, logo and colours in brand.json. HTML is read-only, with no action buttons or running server.

The [compliance guide](docs/compliance.md) cites WorkSafe New Zealand and separates statutory design-information context from internal record checks. References are not certificates. All assigned reviewers must accept before the latest revision can be approved. A new approval supersedes the previous version without erasing its history. Earlier handovers stay visible.

## Bring your RedEye register

Export bucket metadata through RedEye's Bulk CSV Tool. The importer supports its two-header shape and configurable labels, preserves source rows and the original CSV, validates the batch together, and refuses changed source rows pending reconciliation. Imported records start as drafts and require local review. Native files, annotations and historical approval signatures need a separate archive migration. [Switching guide](docs/replace-redeye.md).

```bash
node scripts/drawings.mjs import redeye --file="imports/redeye/sample.csv" --dry-run --actor="Document controller"
```

## Storage and verification

Plain PostgreSQL migrations also run on PGlite. UUIDs, foreign keys, uniqueness constraints, timestamps and indexes support the record model. RLS blocks public access. A controlled database-owner connection operates the CLI. Actor labels and local audit history are not authentication or tamper-proof signatures. Team deployment needs identity, permissions, archive controls, backup and a tested restore.

npm test uses a temporary database and output directory. It exercises domain reads, writes, approval gates, rejection, imports, rollback, repeat imports, original-source preservation, ambiguity, exports, drafts and escaped HTML. CI is configured for Node 20 and 22 on Linux and Windows. See the actual Actions run for platform results.

## Licence

MIT. Copyright (c) 2026 Enterprise DNA. RedEye and Accruent are their owners' trademarks. This independent project is not affiliated with or endorsed by Accruent.
