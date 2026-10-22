---
description: "Update supplied metadata. Read the drawing first. A safety classification is a human decision."
---

# update-drawing

Update supplied metadata. Read the drawing first. A safety classification is a human decision.

```bash
node scripts/drawings.mjs update-drawing "<drawing>" --owner="<owner>" --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
