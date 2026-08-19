const fs = require("fs");
const path = require("path");

function replaceInDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith(".js") || fullPath.endsWith(".jsx")) {
            let content = fs.readFileSync(fullPath, "utf8");
            let updated = content;
            
            // Avoid double wrapping if it's already wrapped, e.g. (selected?.patient_info?.hin || selected?.patient?.hin)
            // But if it's not wrapped, we wrap it.
            
            // Only replace occurrences of ".patient_info.hin" and ".patient_info?.hin" that aren't already part of a fallback
            updated = updated.replace(/(\w+(?:\?\.)?)patient_info(\?)?\.hin/g, (match, prefix, optional) => {
                let opt = optional ? "?" : "";
                return "(" + prefix + "patient_info" + opt + ".hin || " + prefix + "patient" + opt + ".hin)";
            });
            
            // Clean up possible double wrappers if we ran it more than once
            updated = updated.replace(/\(\((.*?)\)\)/g, "($1)");
            
            if (updated !== content) {
                fs.writeFileSync(fullPath, updated, "utf8");
                console.log("Updated", fullPath);
            }
        }
    });
}
replaceInDir("C:/Users/USER/Desktop/DocuHealth/DocuHealth-/src/Components/Dashboard/Hospital_Dashboard_Components");
replaceInDir("C:/Users/USER/Desktop/DocuHealth/DocuHealth-/src/Dashboard/Hospital_Dashboard");
