---
description: "Record a review already performed by the named reviewer. Never infer acceptance from a complete record."
---

# record-review

Record a review already performed by the named reviewer. Never infer acceptance from a complete record.

```bash
node scripts/drawings.mjs record-review "<review-id>" --decision=accepted --evidence="<review evidence>" --actor="<reviewer>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
