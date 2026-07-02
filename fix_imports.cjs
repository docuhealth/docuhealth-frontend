const fs = require('fs');
const path = require('path');
const dir = 'src/Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoComponents';
const files = ['LabPatientInfo.jsx', 'LabTabComponent.jsx', 'LabTabDetails.jsx'];
files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from\s+["'](\.\.\/)+([^"']+)["']/g, (match, dotDot, rest) => {
    const count = (match.match(/\.\.\//g) || []).length;
    if (count > 0) {
      const finalPath = count === 1 ? './' + rest : '../'.repeat(count - 1) + rest;
      return 'from \"' + finalPath + '\"';
    }
    return match;
  });
  if (file === 'LabPatientInfo.jsx') {
    content = content.replace(/from\s+["']\.\/TabComponent["']/g, 'from \"./LabTabComponent\"');
    content = content.replace(/from\s+["']\.\/TabDetails["']/g, 'from \"./LabTabDetails\"');
    content = content.replace(/<TabComponent/g, '<LabTabComponent');
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
});
