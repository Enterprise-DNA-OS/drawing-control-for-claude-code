import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO_ROOT } from './lib/db.mjs';
const env={...process.env,DATABASE_URL:'',DATA_DIR:path.join(REPO_ROOT,'.data/demo'),OUTPUT_DIR:path.join(REPO_ROOT,'.data/demo-output')};
for(const args of [['scripts/seed.mjs'],['scripts/drawings.mjs','attention'],['scripts/drawings.mjs','review-queue'],['scripts/drawings.mjs','compliance'],['scripts/view.mjs'],['scripts/docs.mjs']]){
 const r=spawnSync(process.execPath,args,{cwd:REPO_ROOT,env,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
