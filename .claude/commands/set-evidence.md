---
description: "Complete draft revision references before review starts."
---

# set-evidence

Complete draft revision references before review starts.

```bash
node scripts/drawings.mjs set-evidence "<revision-id>" --file="<file reference>" --purpose="<purpose>" --risk="<risk reference>" --safe-use="<safe-use reference>" --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
