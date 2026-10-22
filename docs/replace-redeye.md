# Replace the RedEye drawing register

This is a migration of metadata and the ongoing drawing-control desk. It is not an automatic copy of every RedEye capability or historical workflow.

## Export

In RedEye, use Manage Bucket, Bulk CSV Tool, Create New and Export Bucket Data, or choose a group. Download Original after the report completes. Keep both header rows. The first holds metadata IDs, the second your configured field labels. Preserve leading zeros by handling IDs and revisions as text.

Source checked 22 October 2026: [RedEye Bulk CSV export](https://help.accruent.com/redeye/Content/Online%20Help/bucket_admin_bulk_csv_tool_edit_artefacts.htm). [Bucket Reports](https://help.accruent.com/redeye/Content/Online%20Help/bucket_admin_bucket_reports.htm) also describes exportable artefact and status reports. The export mechanism is verified; the included sample is synthetic and is not a captured customer export.

## Map your configured fields

Default labels: Artefact ID, Number, Title, Revision, Site, Discipline, Asset, Owner, File Reference. Only the first four are required. RedEye labels vary by bucket, so make a private mapping when yours differ:

```json
{"id":"Artefact ID","number":"Drawing Number","title":"Description","revision":"Revision","site":"Facility","discipline":"Discipline","asset":"Asset Tag","owner":"Document Owner","file_ref":"Archive Reference"}
```

The example names are mapping choices, not a claim every bucket exports those labels. Unmapped fields stay in the original source row and original CSV. Repeated or blank human-readable headers are rejected: map a separate uniquely labelled export and retain the original securely. Single-header reports use --headers=1.

## Import in one command

Install, run npm run migrate on a fresh local database, then:

```bash
node scripts/drawings.mjs import redeye --file="private/export.csv" --map="private/mapping.json" --dry-run --actor="Document controller"
node scripts/drawings.mjs import redeye --file="private/export.csv" --map="private/mapping.json" --actor="Document controller"
```

Omit --map to use the documented default labels. For the fictional sample, use imports/redeye/sample.csv. Paths with spaces work on Windows and Linux. Use a separate DATA_DIR for the trial, or a controlled DATABASE_URL for your own PostgreSQL database.

All rows commit together or none do. The source ID prevents duplicate records. Identical reimports leave local operational changes intact. A changed source row stops the import for reconciliation rather than overwriting decisions. Duplicate drawing numbers, repeated source IDs, blank required fields and malformed CSV also stop it.

## Reconcile and start local control

Compare source and imported counts, drawing numbers, leading zeros, revision labels and archive references. Every imported row creates one draft snapshot, not a historical sequence or approval. Imported drawings default to safety-critical until the operator classifies them. Use update-drawing to set the reviewed classification, set-evidence to record the actual file and design-information references, then assign a review. Local approvals require recorded human decisions.

## What needs separate work

The metadata CSV does not bring native drawing files, binary attachments, annotations, review signatures, historic versions, access permissions, QR codes, user activity or prior transmittals into this system. Download and reconcile files into a controlled archive through RedEye's supported process. Keep their references in the register. Do not cancel the incumbent until archive completeness and every required workflow have been verified.

A metadata import can run in a day. A whole document archive move depends on its size and the history needed. Enterprise DNA scopes archive migration and missing workflows as part of the customised version. No guarantee of a full RedEye replacement in one day is made.
