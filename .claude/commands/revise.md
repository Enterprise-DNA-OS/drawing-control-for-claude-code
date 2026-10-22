---
description: "Create the next revision with its own evidence. Revision labels are text, sequence is automatic."
---

# revise

Create the next revision with its own evidence. Revision labels are text, sequence is automatic.

```bash
node scripts/drawings.mjs revise "<drawing>" --revision="<label>" --file="<file reference>" --purpose="<purpose>" --risk="<risk reference>" --safe-use="<safe-use reference>" --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
