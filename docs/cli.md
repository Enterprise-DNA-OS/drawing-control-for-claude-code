# Drawing CLI

Node 20+. Run npm install, then npm run migrate. For the fictional demo use npm run demo. All commands below accept --json for structured output. Human output is the default. Mutation flags use --key=value, including quoted values with spaces. Unknown names and ambiguous prefixes fail with exit code 1 and candidates.

## register

Read the drawing register, current approval and latest work in progress.

```bash
node scripts/drawings.mjs register
```

## drawing

Read a drawing, all revisions and operator notes.

```bash
node scripts/drawings.mjs drawing "<number or title>"
```

## review-queue

Review overdue assignments and safety-critical drawings first.

```bash
node scripts/drawings.mjs review-queue
```

## handover-check

Check acknowledgements and handovers containing superseded revisions.

```bash
node scripts/drawings.mjs handover-check
```

## revision-history

Read ordered revision history and approval evidence.

```bash
node scripts/drawings.mjs revision-history
```

## file-register

Read drawing file references. Check file contents through the approved document process.

```bash
node scripts/drawings.mjs file-register
```

## activity

Read local mutation history with operator labels.

```bash
node scripts/drawings.mjs activity
```

## attention

Find overdue reviews, late acknowledgements and drawings with stale notes.

```bash
node scripts/drawings.mjs attention
```

## compliance

Check design information references and record-control exceptions. Read docs/compliance.md first.

```bash
node scripts/drawings.mjs compliance
```

## dashboard

Count drawings and missing approvals by site and discipline.

```bash
node scripts/drawings.mjs dashboard
```

## insights

Answer ten cross-record questions with the actual results.

```bash
node scripts/drawings.mjs insights
```

## add

Create a drawing only from operator-supplied facts.

```bash
node scripts/drawings.mjs add --number="<number>" --title="<title>" --site="<site>" --discipline="<discipline>" --owner="<owner>" --critical=true --actor="<operator>"
```

## update-drawing

Update supplied metadata. Read the drawing first. A safety classification is a human decision.

```bash
node scripts/drawings.mjs update-drawing "<drawing>" --owner="<owner>" --actor="<operator>"
```

## set-evidence

Complete draft revision references before review starts.

```bash
node scripts/drawings.mjs set-evidence "<revision-id>" --file="<file reference>" --purpose="<purpose>" --risk="<risk reference>" --safe-use="<safe-use reference>" --actor="<operator>"
```

## revise

Create the next revision with its own evidence. Revision labels are text, sequence is automatic.

```bash
node scripts/drawings.mjs revise "<drawing>" --revision="<label>" --file="<file reference>" --purpose="<purpose>" --risk="<risk reference>" --safe-use="<safe-use reference>" --actor="<operator>"
```

## submit-review

Assign a real reviewer and the agreed internal due date.

```bash
node scripts/drawings.mjs submit-review "<revision-id>" --reviewer="<reviewer>" --due=YYYY-MM-DD --actor="<operator>"
```

## record-review

Record a review already performed by the named reviewer. Never infer acceptance from a complete record.

```bash
node scripts/drawings.mjs record-review "<review-id>" --decision=accepted --evidence="<review evidence>" --actor="<reviewer>"
```

## approve

Record an explicit engineering approval supplied by the operator. Read all reviews and evidence first.

```bash
node scripts/drawings.mjs approve "<revision-id>" --evidence="<decision reference>" --actor="<approver>"
```

## transmit

Record a handover schedule of current approved revisions. This records locally and sends nothing.

```bash
node scripts/drawings.mjs transmit --reference="<reference>" --revisions="<revision-id>,<revision-id>" --recipient="<recipient>" --purpose="<purpose>" --due=YYYY-MM-DD --actor="<operator>"
```

## acknowledge

Record receipt only when the operator provides evidence.

```bash
node scripts/drawings.mjs acknowledge "<transmittal>" --evidence="<receipt reference>" --actor="<operator>"
```

## log

Add a factual note to the drawing history.

```bash
node scripts/drawings.mjs log "<drawing>" --note="<note>" --actor="<operator>"
```

## weekly-review

Draft the Monday review from dashboard, attention and compliance. Present exceptions and named owners.

```bash
node scripts/drawings.mjs weekly-review
```

## draft-transmittal

Draft a cover sheet from a recorded handover. Check current revision status before sharing.

```bash
node scripts/drawings.mjs draft-transmittal "<transmittal>"
```

## draft-review

Draft a review request from the full drawing history.

```bash
node scripts/drawings.mjs draft-review "<drawing>"
```

## import

Read docs/replace-redeye.md. Inspect the two header rows, map labels and run a dry run before importing.

```bash
node scripts/drawings.mjs import redeye --file="<export.csv>" --map="<mapping.json>" --dry-run --actor="<operator>"
```

## export

Export every domain record, original import and audit event to a private destination.

```bash
node scripts/drawings.mjs export --json
```

## view

Render read-only drawing, handover and record-check dashboards.

```bash
npm run view
```

## documents

Render branded draft transmittals, revision records and design information schedules.

```bash
npm run docs
```

## Inputs and outputs

add also accepts --asset and --critical=true|false. update-drawing accepts --title, --site, --discipline, --asset, --owner and --critical before approval. set-evidence accepts --file, --purpose, --risk and --safe-use on drafts only. revise automatically chooses the next numeric sequence, preserving revision labels such as 01, A or P02. record-review also accepts --decision=rejected. A rejection blocks approval; create a new revision to correct it.

transmit accepts a comma-separated list of revision IDs. All must be currently approved. It records a schedule only, sends no files and creates no external notification. acknowledge records receipt evidence without changing revision validity. --dry-run rolls back a mutation transaction and is especially useful for import. Use docs/replace-redeye.md for the field contract.

export --json emits all domain records, notes, local audits and original imports. Save its output outside version control. It is a portable record export, not an automatic full database restore. Back up and restore the database and archive together before production use.

DATABASE_URL chooses PostgreSQL. Without it, DATA_DIR defaults to .data/db. OUTPUT_DIR changes the private root for drafts, views and docs-out. On PowerShell use $env:DATA_DIR='path'; on Bash prefix a command with DATA_DIR=path. The demo always forces a separate local database and outputs under .data.
