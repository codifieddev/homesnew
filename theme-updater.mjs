import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function updateTheme() {
  let count = 0;
  walkDir('./src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let newContent = content
        .replaceAll('bg-[#0B1521]', 'bg-background')
        .replaceAll('text-[#0B1521]', 'text-foreground')
        .replaceAll('border-[#0B1521]', 'border-foreground')
        
        .replaceAll('bg-[#12202E]', 'bg-card')
        .replaceAll('text-[#12202E]', 'text-card-foreground')
        
        .replaceAll('bg-[#1A2E42]', 'bg-muted')
        .replaceAll('text-[#1A2E42]', 'text-muted')
        
        .replaceAll('text-[#8A9BAE]', 'text-muted-foreground')
        .replaceAll('text-[#4A5E72]', 'text-muted-foreground')
        
        .replaceAll('text-[#C9A96E]', 'text-primary')
        .replaceAll('bg-[#C9A96E]', 'bg-primary')
        .replaceAll('border-[#C9A96E]', 'border-primary')
        .replaceAll('fill-[#C9A96E]', 'fill-primary')
        
        .replaceAll('hover:text-[#E2C99A]', 'hover:text-primary-light')
        .replaceAll('hover:bg-[#E2C99A]', 'hover:bg-primary-light')
        .replaceAll('text-[#E2C99A]', 'text-primary-light')
        .replaceAll('bg-[#E2C99A]', 'bg-primary-light')
        
        .replaceAll('text-[#F5ECD9]', 'text-primary-pale')
        .replaceAll('bg-[#F5ECD9]', 'bg-primary-pale')

        .replaceAll('from-[#C9A96E]', 'from-primary')
        .replaceAll('to-[#E2C99A]', 'to-primary-light')
        
        .replaceAll('from-[#0B1521]', 'from-background')
        .replaceAll('to-transparent', 'to-transparent')
        
        .replaceAll('border-white/[0.08]', 'border-border')
        .replaceAll('border-white/[0.06]', 'border-border')
        .replaceAll('border-white/10', 'border-border')
        .replaceAll('border-white/20', 'border-border')
        
        .replaceAll('bg-white/[0.04]', 'bg-accent')
        .replaceAll('bg-white/[0.05]', 'bg-accent/80')
        .replaceAll('hover:bg-white/[0.04]', 'hover:bg-accent')
        .replaceAll('bg-white/[0.02]', 'bg-accent/40');
        
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        count++;
        console.log(`Updated: ${filePath}`);
      }
    }
  });
  console.log(`\nReplacement complete. Updated ${count} files.`);
}

updateTheme();
