---
description: "Create a drawing only from operator-supplied facts."
---

# add

Create a drawing only from operator-supplied facts.

```bash
node scripts/drawings.mjs add --number="<number>" --title="<title>" --site="<site>" --discipline="<discipline>" --owner="<owner>" --critical=true --actor="<operator>"
```

Use the operator's exact facts and configured database. Add --json to the drawing CLI when reading results programmatically. List ambiguous matches instead of choosing. Present unknown facts as unknown. Drafts stay in drafts/. Never send or issue documents, infer approval, or claim engineering compliance. Actor names are labels, not authenticated signatures.
