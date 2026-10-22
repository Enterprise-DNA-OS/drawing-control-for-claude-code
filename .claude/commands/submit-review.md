---
description: "Assign a real reviewer and the agreed internal due date."
---

# submit-review

Assign a real reviewer and the agreed internal due date.

```bash
node scripts/drawings.mjs submit-review "<revision-id>" --reviewer="<reviewer>" --due=YYYY-MM-DD --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
