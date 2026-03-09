const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

/**
 * Rules for renaming directories.
 * We want to process deepest directories first to avoid path invalidation.
 */
function getNewDirName(dirName) {
    if (dirName === 'Pages_') return 'Pages';
    
    // For specific known contexts
    if (dirName === 'Hospital Context') return 'HospitalContext';
    if (dirName === 'Patient Context') return 'PatientContext';
    
    // For Dashboards components (e.g. "Appointments Dashboard" -> "Appointments_Dashboard")
    if (dirName.endsWith(' Dashboard') && dirName !== 'Dashboard') {
        return dirName.replace(/ /g, '_');
    }
    
    // Default: remove spaces (e.g. "Home Page" -> "HomePage")
    if (dirName.includes(' ')) {
        return dirName.replace(/ /g, '');
    }
    
    return dirName;
}

// 1. Gather all directories and calculate their new paths
const dirsToRename = [];

function walkAndCollectDirs(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            walkAndCollectDirs(filePath); // traverse down first
            
            const newName = getNewDirName(file);
            if (newName !== file) {
                const newPath = path.join(dir, newName);
                dirsToRename.push({ oldPath: filePath, newPath: newPath, oldName: file, newName: newName });
            }
        }
    }
}

walkAndCollectDirs(srcDir);

// Sort by depth (deepest first) to ensure parent renamed doesn't break child rename
dirsToRename.sort((a, b) => b.oldPath.split(path.sep).length - a.oldPath.split(path.sep).length);

// Also we need pairs of strings to replace in file contents.
// Since we have absolute paths, we can construct the relative import changes.
// Or we can just build a list of string replacements.
const importReplacements = [
    { from: /Pages_\//g, to: 'Pages/' },
    { from: /Pages_'/g, to: 'Pages\'' },
    { from: /Pages_"/g, to: 'Pages"' }
];

// Build replacements based on the renamed dirs.
// A safe heuristic for imports is replacing "/<oldName>/" with "/<newName>/"
// and "/<oldName>'" with "/<newName>'"
// But there could be clashes. Order by length descending so more specific ones are replaced first.
const nameReplacements = [];
for (const item of dirsToRename) {
    nameReplacements.push({ oldName: item.oldName, newName: item.newName });
}
// Sort by length of oldName descending
nameReplacements.sort((a, b) => b.oldName.length - a.oldName.length);

for (const rep of nameReplacements) {
    // Escaping for regex
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeOldName = escapeRegExp(rep.oldName);
    
    // Replace "/Old Name/" with "/NewName/"
    importReplacements.push({ from: new RegExp(`/${safeOldName}/`, 'g'), to: `/${rep.newName}/` });
    // Replace "/Old Name'"
    importReplacements.push({ from: new RegExp(`/${safeOldName}'`, 'g'), to: `/${rep.newName}'` });
    // Replace "/Old Name""
    importReplacements.push({ from: new RegExp(`/${safeOldName}"`, 'g'), to: `/${rep.newName}"` });
}

console.log("Renaming directories...");
for (const item of dirsToRename) {
    if (fs.existsSync(item.oldPath)) {
        console.log(`Renaming: ${item.oldPath} -> ${item.newPath}`);
        fs.renameSync(item.oldPath, item.newPath);
    }
}

console.log("Updating imports in JS/JSX files...");

function walkAndReplaceImports(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            walkAndReplaceImports(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            for (const rep of importReplacements) {
                newContent = newContent.replace(rep.from, rep.to);
            }
            if (content !== newContent) {
                console.log(`Updated imports in: ${filePath}`);
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
        }
    }
}

walkAndReplaceImports(srcDir);
console.log("Done refactoring.");
