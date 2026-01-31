const fs = require('fs');
const path = require('path');

const files = ['dist/client.js', 'dist/client.cjs'];

files.forEach((file) => {
  const filePath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Add use client
    if (!content.includes('use client')) {
      content = "'use client';\n" + content;
      changed = true;
      console.log('Added use client to ' + file);
    }

    // Add CSS import if corresponding CSS file exists
    // tsup extracts css to [filename].css in the same directory usually
    // We check for that file.
    let cssFileName = path.basename(file).replace(/\.(js|cjs)$/, '.css');
    let cssFilePath = path.join(path.dirname(filePath), cssFileName);

    // Construct the import string
    let cssImport = '';
    if (file.endsWith('.cjs')) {
      cssImport = `require('./${cssFileName}');\n`;
    } else {
      cssImport = `import './${cssFileName}';\n`;
    }

    if (fs.existsSync(cssFilePath) && !content.includes(cssImport.trim())) {
      // Insert after 'use client'; or at top
      if (content.startsWith("'use client';")) {
        content = content.replace("'use client';\n", "'use client';\n" + cssImport);
      } else if (content.startsWith('"use client";')) {
        content = content.replace('"use client";\n', '"use client";\n' + cssImport);
      } else {
        content = cssImport + content;
      }
      changed = true;
      console.log('Added CSS import to ' + file);
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
    }
  }
});
