const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'process', 'topics');

function fixScriptBlocks() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
  let modifiedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    const regex = /<ScriptBlock([^>]*)>([\s\S]*?)<\/ScriptBlock>/g;
    let fileModified = false;
    
    const newContent = content.replace(regex, (match, attrs, inner) => {
      const trimmed = inner.trim();
      
      // If it's empty, already a template literal, or already contains JSX, skip it.
      if (!trimmed || trimmed.startsWith('{') || trimmed.startsWith('<')) {
        return match;
      }
      
      // It's plain text. We need to escape backticks and ${}
      let escaped = inner.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      
      fileModified = true;
      return `<ScriptBlock${attrs}>{\`${escaped}\`}</ScriptBlock>`;
    });

    if (fileModified) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      modifiedCount++;
      console.log(`Fixed: ${file}`);
    }
  });

  console.log(`\nSuccessfully fixed ${modifiedCount} files.`);
}

fixScriptBlocks();
