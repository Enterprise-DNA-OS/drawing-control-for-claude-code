---
description: "Read docs/replace-redeye.md. Inspect the two header rows, map labels and run a dry run before importing."
---

# import

Read docs/replace-redeye.md. Inspect the two header rows, map labels and run a dry run before importing.

```bash
node scripts/drawings.mjs import redeye --file="<export.csv>" --map="<mapping.json>" --dry-run --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
