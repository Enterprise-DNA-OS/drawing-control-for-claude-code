---
description: "Record a handover schedule of current approved revisions. This records locally and sends nothing."
---

# transmit

Record a handover schedule of current approved revisions. This records locally and sends nothing.

```bash
node scripts/drawings.mjs transmit --reference="<reference>" --revisions="<revision-id>,<revision-id>" --recipient="<recipient>" --purpose="<purpose>" --due=YYYY-MM-DD --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
