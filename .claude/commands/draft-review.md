---
description: "Draft a review request from the full drawing history."
---

# draft-review

Draft a review request from the full drawing history.

```bash
node scripts/drawings.mjs draft-review "<drawing>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
