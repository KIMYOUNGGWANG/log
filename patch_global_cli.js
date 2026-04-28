const fs = require('fs');
const file = '/Users/kim-young-gwang/.npm-global/lib/node_modules/oh-my-agent/bin/cli.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/await J7\(\{message:"Response language\?",[\s\S]*?initialValue:[^}]+\}\)/, '"ko"');
code = code.replace(/await J7\(\{message:"Model preset\?",[\s\S]*?initialValue:[^}]+\}\)/, '"claude-only"');
code = code.replace(/await J7\(\{message:"What type of project\?",[\s\S]*?\}\]\}\)/, '"all"');
code = code.replace(/await J7\(\{message:"Backend language\?",[\s\S]*?initialValue:[^}]+\}\)/, '"python"');
code = code.replace(/let u=await t6\(\{message:`\$\{P\} export writes to HOME[\s\S]*?initialValue:!1\}\);/g, 'let u=true;');

fs.writeFileSync(file, code);
console.log('Patched global cli.js successfully v2');
