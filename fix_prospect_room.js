const fs = require('fs');
const file = 'src/pages/discovery/ProspectRoom.tsx';
let code = fs.readFileSync(file, 'utf8');

// I will write a simple sed or regex to put the useEffect back.
code = code.replace(/    if \(token\) {\n      if \(token === 'cushman-ohio-portfolio'\) {/g, '  useEffect(() => {\n    if (token) {\n      if (token === \'cushman-ohio-portfolio\') {');

fs.writeFileSync(file, code);
