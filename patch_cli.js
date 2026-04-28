const fs = require('fs');
const file = '/Users/kim-young-gwang/node_modules/oh-my-agent/bin/cli.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/await CU\(\{message:"CLI tools to configure:"[^]*?\}\)/, '["claude"]');
code = code.replace(/await J7\(\{message:"Response language\?",[^]*?\}\)/, '"ko"');
code = code.replace(/await J7\(\{message:"Model preset\?",[^]*?\}\)/, '"claude-only"');
code = code.replace(/await J7\(\{message:"What type of project\?",[^]*?\}\)/, '"all"');
code = code.replace(/await J7\(\{message:"Backend language\?",[^]*?\}\)/, '"python"');
code = code.replace(/await t6\(\{message:[^]*?\}\)/g, 'false');

fs.writeFileSync(file, code);
console.log('Patched cli.js successfully');
