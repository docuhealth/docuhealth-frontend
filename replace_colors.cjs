const fs = require('fs');
const path = require('path');

const colorMap = {
  "[#3E4095]": "docuhealth-primary",
  "[#647284]": "docuhealth-secondary",
  "[#1B2B40]": "docuhealth-dark",
  "[#FAFAFA]": "docuhealth-light-gray",
  "[#0000FF]": "docuhealth-blue",
  "[#2e3070]": "docuhealth-dark-primary",
  "[#464646]": "docuhealth-gray",
  "[#797979]": "docuhealth-gray-medium",
  "[#F6FCFE]": "docuhealth-light-blue",
  "[#08A913]": "docuhealth-green",
  "[#D2F5DB]": "docuhealth-light-green",
  "[#313131]": "docuhealth-gray-dark",
  "[#BDB5B5]": "docuhealth-gray-light",
  "[#EFEFEF]": "docuhealth-gray-lighter",
  "[#F5F5F5]": "docuhealth-gray-lightest",
  "[#0B6011]": "docuhealth-green-dark",
  "[#FAFEFF]": "docuhealth-bg-light",
  "[#9000FF]": "docuhealth-purple",
  "[#33357a]": "docuhealth-primary-hover",
  "[#ECFAFF]": "docuhealth-blue-lightest",
  "[#EEEEFD]": "docuhealth-primary-lightest",
  "[#F5F8F8]": "docuhealth-gray-cool",
  "[#F8F9FF]": "docuhealth-primary-faded",
  "[#DCE2EA]": "docuhealth-border-light",
  "[#e6e6f5]": "docuhealth-primary-muted",
  "[#2e3075]": "docuhealth-primary-darker",
  "[#F2F2F2]": "docuhealth-bg-gray",
  "[#1C1CFE]": "docuhealth-blue-bright",
  "[#F8F9FA]": "docuhealth-bg-offwhite",
  "[#1f1f75]": "docuhealth-primary-deep",
  "[#212121]": "docuhealth-text-main",
  "[#727272]": "docuhealth-text-muted",
  "[#34345F]": "docuhealth-nav-dark",
  "[#E6F4FB]": "docuhealth-blue-pale",
  "[#0E0E31]": "docuhealth-footer-dark",
  "[#1F2937]": "docuhealth-gray-800",
  "[#8A8883]": "docuhealth-gray-warm",
  "[#2e307a]": "docuhealth-primary-variant",
  "[#d97706]": "docuhealth-amber-600",
  "[#b1b2d4]": "docuhealth-primary-soft",
  "[#E7E4FD]": "docuhealth-purple-light",
  "[#FDF4E4]": "docuhealth-orange-light",
  "[#FDE4E4]": "docuhealth-red-light",
  "[#E4ECFD]": "docuhealth-blue-soft",
  "[#ECE4FD]": "docuhealth-violet-light",
  "[#f5f9ff]": "docuhealth-blue-faded",
  "[#B9BBFF]": "docuhealth-primary-light",
  "[#DDDDDD]": "docuhealth-border-gray"
};

function walk(dir) {
  let modifiedFilesCount = 0;
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      modifiedFilesCount += walk(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.html')) {
      let content = fs.readFileSync(p, 'utf-8');
      let originalContent = content;
      
      for (const [hex, variable] of Object.entries(colorMap)) {
        // Replace e.g. text-[#3E4095] with text-docuhealth-primary
        const escapedHex = hex.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        // Handle arbitrary tailwind prefixes (e.g., hover:bg-[#...], sm:text-[#...])
        // The regex below matches any word-like boundary up to the prefix, followed by the hex.
        const regex = new RegExp(`(bg|text|border|ring|shadow|fill|stroke|from|via|to|outline|divide|accent|caret|decoration|placeholder|ring-offset)-${escapedHex}`, 'g');
        
        content = content.replace(regex, `$1-${variable}`);
      }
      
      for (const [hexWithBrackets, variable] of Object.entries(colorMap)) {
        const rawHex = hexWithBrackets.slice(1, -1);
        const regexQuotes = new RegExp(`(['"])${rawHex}(['"])`, 'gi');
        content = content.replace(regexQuotes, `$1var(--color-${variable})$2`);
      }

      if (content !== originalContent) {
        fs.writeFileSync(p, content, 'utf-8');
        modifiedFilesCount++;
        console.log(`Modified ${p}`);
      }
    }
  });
  return modifiedFilesCount;
}

const modifiedCount = walk('src');
console.log(`\nFinished replacing colors. Modified ${modifiedCount} files.`);
