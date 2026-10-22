---
description: "Add a factual note to the drawing history."
---

# log

Add a factual note to the drawing history.

```bash
node scripts/drawings.mjs log "<drawing>" --note="<note>" --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
