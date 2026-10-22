---
description: "Record receipt only when the operator provides evidence."
---

# acknowledge

Record receipt only when the operator provides evidence.

```bash
node scripts/drawings.mjs acknowledge "<transmittal>" --evidence="<receipt reference>" --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
