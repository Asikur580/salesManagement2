const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'resources', 'js', 'components', 'shop'),
    path.join(__dirname, 'resources', 'js', 'components', 'layout'),
    path.join(__dirname, 'resources', 'js', 'Pages')
];

const patterns = [
    { regex: /bg-\[\#FF4E00\]/g, replacement: 'bg-primary' },
    { regex: /text-\[\#FF4E00\]/g, replacement: 'text-primary' },
    { regex: /border-\[\#FF4E00\]/g, replacement: 'border-primary' },
    { regex: /hover:bg-\[\#FF4E00\]/g, replacement: 'hover:bg-primary' },
    { regex: /hover:text-\[\#FF4E00\]/g, replacement: 'hover:text-primary' },
    { regex: /hover:border-\[\#FF4E00\]/g, replacement: 'hover:border-primary' },
    
    { regex: /\bbg-white\b/g, replacement: 'bg-card' },
    { regex: /\bhover:bg-white\b/g, replacement: 'hover:bg-card' },
    { regex: /\bbg-gray-50\b/g, replacement: 'bg-muted' },
    { regex: /\bhover:bg-gray-50\b/g, replacement: 'hover:bg-muted' },
    { regex: /\bbg-gray-100\b/g, replacement: 'bg-muted/80' },
    { regex: /\bhover:bg-gray-100\b/g, replacement: 'hover:bg-muted/80' },
    
    { regex: /\btext-gray-900\b/g, replacement: 'text-foreground' },
    { regex: /\btext-gray-800\b/g, replacement: 'text-foreground' },
    { regex: /\bgroup-hover:text-gray-800\b/g, replacement: 'group-hover:text-foreground' },
    
    { regex: /\btext-gray-700\b/g, replacement: 'text-card-foreground' },
    { regex: /\btext-gray-600\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-gray-500\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-gray-400\b/g, replacement: 'text-muted-foreground' },
    { regex: /\btext-gray-300\b/g, replacement: 'text-muted-foreground' },
    
    { regex: /\bhover:text-gray-900\b/g, replacement: 'hover:text-foreground' },
    { regex: /\bhover:text-gray-800\b/g, replacement: 'hover:text-foreground' },
    
    { regex: /\bborder-gray-100\b/g, replacement: 'border-border' },
    { regex: /\bborder-gray-200\b/g, replacement: 'border-border' },
    { regex: /\bborder-gray-300\b/g, replacement: 'border-border' }
];

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const { regex, replacement } of patterns) {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

directories.forEach(processDirectory);
console.log('Update complete.');
