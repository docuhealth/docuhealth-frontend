const fs = require('fs');
const lines = fs.readFileSync('src/Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoComponents/LabPatientInfo.jsx', 'utf8').split(/\r?\n/);

let newLines = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];

  // Remove state hooks
  if (line.includes('const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);') ||
      line.includes('const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);')) {
    i++;
    continue;
  }

  // Remove the block {viewDetailMedicalRecord ? ( ... ) : ( <> ... </> )}
  if (line.includes('{viewDetailMedicalRecord ? (')) {
    // Skip everything until the else block's opening tags
    while (i < lines.length && !lines[i].includes(') : (')) {
      i++;
    }
    // Now we are at `) : (`
    i++;
    // Skip `<>`
    while (i < lines.length && !lines[i].includes('<>')) {
      i++;
    }
    i++;
    continue;
  }

  if (line.includes('        </>') && i < lines.length - 1 && lines[i+1].includes('      )}')) {
    // Skip the closing `</>\n      )}`
    i += 2;
    continue;
  }

  // Simplify getTabs
  if (line.includes('tabs={getTabs({')) {
    newLines.push('                tabs={getTabs({ patientFullInfo: { patient_info: selectedPatientDetails?.patient || {} } })}');
    // Skip all the arguments
    while (i < lines.length && !lines[i].includes('/>')) {
      i++;
    }
    i++; // skip '/>'
    continue;
  }

  newLines.push(line);
  i++;
}

fs.writeFileSync('src/Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoComponents/LabPatientInfo.jsx', newLines.join('\n'));
