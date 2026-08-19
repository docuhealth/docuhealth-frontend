const fs = require("fs");
const path = require("path");

function replaceInDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith(".js") || fullPath.endsWith(".jsx")) {
            let content = fs.readFileSync(fullPath, "utf8");
            let updated = content.replace(/(set[A-Za-z]+)\(prev\)\s*=>/g, "$1((prev) =>");
            if (updated !== content) {
                fs.writeFileSync(fullPath, updated, "utf8");
                console.log("Updated", fullPath);
            }
        }
    });
}
replaceInDir("C:/Users/USER/Desktop/DocuHealth/DocuHealth-/src");
