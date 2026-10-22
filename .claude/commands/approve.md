---
description: "Record an explicit engineering approval supplied by the operator. Read all reviews and evidence first."
---

# approve

Record an explicit engineering approval supplied by the operator. Read all reviews and evidence first.

```bash
node scripts/drawings.mjs approve "<revision-id>" --evidence="<decision reference>" --actor="<approver>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
