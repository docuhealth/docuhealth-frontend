const fs = require('fs');
const path = require('path');

function fixSyntaxLineByLine(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixSyntaxLineByLine(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let lines = content.split('\n');
            let modified = false;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/set[A-Za-z]+\(prev\)\s*=>/)) {
                    // It has the syntax error.
                    // Replace setX(prev) => with setX((prev) =>
                    lines[i] = lines[i].replace(/(set[A-Za-z]+)\(prev\)\s*=>/, "$1((prev) =>");
                    
                    // Now, because it was missing an outer parenthesis, we need to add the closing parenthesis before the semicolon.
                    // E.g., `... });` becomes `... }));`
                    if (lines[i].trim().endsWith("});")) {
                        lines[i] = lines[i].replace(/}\);$/, "}));");
                    }
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
                console.log('Successfully fixed', fullPath);
            }
        }
    });
}
fixSyntaxLineByLine('C:/Users/USER/Desktop/DocuHealth/DocuHealth-/src');
